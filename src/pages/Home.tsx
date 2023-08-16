import { IonAlert, IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonPage, IonTitle, IonToolbar } from '@ionic/react';

import './Home.css';

import { Device } from '@capacitor/device';
import {Network} from "@capacitor/network"
import { UsuariosRepo } from '../repository/UsuariosRepo';
import { useEffect, useState } from 'react';
import { Repository } from '../repository/Repository';
import { Usuarios } from '../models/Usuarios';
import { IdSegunDevice } from '../models/IdSegunDevice';

import { get, post } from "../service/Apiservice"
import * as CryptoJS from 'crypto-js';



const Home: React.FC = () => {

  var idDevice: string;
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [incorretPass, setincorretPass] = useState<boolean>(false)
  const [usuario,setUsuario]=useState<Usuarios>()
  
  const usuariosRepo = new UsuariosRepo()
  const devicerepository = new Repository<IdSegunDevice>("idsegundevice")
  

  const logCurrentNetworkStatus = async () => {
    const status = await Network.getStatus();
    console.log('Network status:', status);
  };
  const handleLogin = async (e: any) => {
    e.preventDefault();
    const currentUsuario = await usuariosRepo.getUsuarioByNombre(name)
    console.log("Usuario " + JSON.stringify(currentUsuario[0]))
    const hashedInputPassword = CryptoJS.MD5(password).toString();
    if (hashedInputPassword === currentUsuario[0]?.password) {
      setincorretPass(false)
      setUsuario(currentUsuario[0])
      sessionStorage.setItem("currenUser",JSON.stringify(currentUsuario[0]))
      
      console.log("contraseña correcta ")
      window.location.reload()
    } else {
      setincorretPass(true)
      console.log("contraseña incorrecta ")
    }
   

  }
  useEffect(() => {
    async function de_vice() {
      Device.getId().then(async (info) => {
        console.log(info.identifier)
        idDevice = info.identifier
      })
    }
    
    de_vice()
    logCurrentNetworkStatus();
  }, [])

  useEffect(() => {
    async function getLastRow() {
      try {
        const lastRow = await get<any>("/findbynrodevice/" + idDevice)
        .then(async(res)=>{
          console.log("id ultimo " + res)
          let currentUser =localStorage.getItem("user")
          if (currentUser===null ) {
            
            console.log("No es igual")
              const ultimoLastRow = await get<any>("/ultimarowdevice")
                .then(async (resp) => {
                  console.log("ultimo " + JSON.stringify(resp))
                  const data: any = {
                    nroDevice: idDevice,
                    minId: resp[0].minId + 100000,
                    maxId: resp[0].maxId + 100000,
                    sqlDelete: 0,
                    lastModified: Math.floor(new Date().getTime() / 1000)
                  }
                  console.log("dta " + JSON.stringify(data))
                  localStorage.setItem("user",JSON.stringify(data))
                  await post<IdSegunDevice, any>("/crearultimoid", data)
                    .then((res) => {
                      console.log("res " + JSON.stringify(res))
                    })
                })
          }
        })
       

      } catch (error) {
        console.log("error")
      }
    }
    getLastRow()
  }, [])

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2>Iniciar sesión</h2>
          <form onSubmit={(e) => handleLogin(e)} method='post'>
            <IonItem>
              <IonLabel position="floating">Usuario</IonLabel>
              <IonInput
                required
                value={name}
                placeholder="Nombre"
                onIonChange={(e) => setName(e.detail.value!)}
                color="primary"
                style={{ marginBottom: '10px' }}
              ></IonInput>
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Contraseña</IonLabel>
              <IonInput
                required
                value={password}
                placeholder="Contraseña"
                type="password"
                onIonChange={(e) => setPassword(e.detail.value!)}
                color="primary"
                style={{ marginBottom: '10px' }}
              ></IonInput>
            </IonItem>


            <IonButton expand="full" color="primary" type='submit'>
              Iniciar sesión
            </IonButton>
          </form>
          <IonAlert
            isOpen={incorretPass}
            onDidDismiss={() => setincorretPass(false)}
            header="Alerta"
            subHeader="Mensaje importante"
            message="tu contraseña es incorrecta!"
            buttons={['OK']}

          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
