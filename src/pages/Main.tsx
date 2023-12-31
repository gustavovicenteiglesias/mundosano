import { IonButton, IonCol, IonContent, IonGrid, IonIcon, IonItem, IonLabel, IonLoading, IonPage, IonRow } from '@ionic/react';
import { useEffect, useState } from 'react';
import { downloadOutline } from 'ionicons/icons';
import React from 'react';
import moment from 'moment';
import axios from "axios";
import logoAdesar from "../assest/adesar.png";
import logoUnsada from "../assest/unsada.png";
import logoMundoSano from "../assest/mundosano.png";
import { sqlite, existingConn, db } from "../App"
import { SQLiteDBConnection } from "react-sqlite-hook";
import { CargarBase } from '../data/CargarBase';
import { Network } from '@capacitor/network';



const Main: React.FC<any> = () => {
    const [fechaActualizacion, setFechadeActualizacion] = useState<any>();
    const [hiddenFecha, sethiddenFecha] = useState<boolean>(false)
    const [data, setData] = useState<any>();
    const [colorLogo, setColorLogo] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [loadindImport, setLoadingImport] = useState<boolean>(false);
    const [hayInternet,setHayInternet]=useState<boolean>(true)

    Network.addListener('networkStatusChange', status => {
        console.log('Network status changed', status);
        if(status.connected){
            setHayInternet(true)
        }else{
            setHayInternet(false)
        }
      });

    const logCurrentNetworkStatus = async () => {
        const status = await Network.getStatus();
        if(status.connected){
            setHayInternet(true)
        }else{
            setHayInternet(false)
        }
        console.log('Network status:', status);
      };
      useEffect(()=>{
        logCurrentNetworkStatus()
            },[])

    const dbdb = async () => {
        const ret = await sqlite.checkConnectionsConsistency();
        const isConn = (await sqlite.isConnection("triplefrontera")).result;
        var db: SQLiteDBConnection;
        if (ret.result && isConn) {
            return db = await sqlite.retrieveConnection("triplefrontera");
        } else {
            return db = await sqlite.createConnection("triplefrontera");
        }
    }




    const exportJson = async () => {
        try {

            const db = await dbdb()

            await db.open();

            let res: any = await db.exportToJson("partial")
            if (res.export) {
                console.log("existen datos a exportar ")
                // Creamos un objeto Date con el tiempo Unix, multiplicándolo por 1000 para convertirlo a milisegundos
                let resp: any = await db.query("SELECT * FROM sync_table ORDER BY id DESC LIMIT 1")

                const date = new Date(Number(resp.values[0].sync_date) * 1000);

                // Usamos los métodos de Date para obtener el año, mes y día en formato "YYYY-MM-DD"
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');

                // Unimos las partes para formar la fecha en formato "YYYY-MM-DD"
                const formattedDate = `${year}-${month}-${day}`;
                setData(res.export)
                setFechadeActualizacion(formattedDate);
                sethiddenFecha(true);


            }
            console.log(JSON.stringify(res.export))


            // setPaises(JSON.parse(res.values) )
            db.close()

            return true;
        }
        catch (error: any) {
            return false;
        }
    }
  


    const exportJsontoApi = async () => {
        const db = await dbdb()
        setLoading(true)
        axios.post("https://areco.gob.ar:9535/api/sqlite", data)
            .then(async (resp) => {

                setLoading(false)
                console.log(resp.data.success)
                if (resp.data.success) {
                    await db.open();
                    const d = new Date();
                    const de = Math.floor(new Date().getTime() / 1000);
                    await db.setSyncDate(d.toISOString());
                    await db.close()

                    const datos = {
                        id: 0,
                        syncDate: de
                    }

                    console.log(`fecha ${de}`)
                    axios.post("https://areco.gob.ar:9535/api/sync_date", datos)
                    setColorLogo(true)
                } else {
                    setColorLogo(false)
                }
            })
    }

    
    // Función genérica para combinar los valores de los arrays con las interfaces
    function combinarValores<T extends object>(interfaz: T, arrays: any[][]): T[] {
        return arrays.map((elemento) => {
            const objeto = {} as T;
            Object.keys(interfaz).forEach((prop, index) => {
                objeto[prop as keyof T] = elemento[index];
            });
            return objeto;
        });
    }


    const nuevaBBDD = async () => {
      
        const db = await dbdb()
            let borrar: any = await db.delete()
            console.log("se borro")
            let existe: any = await sqlite.isDatabase("triplefrontera")
            console.log(`Existe ${JSON.stringify(existe)}`)
    
            if (!existe.result) {
                setLoadingImport(true)
                console.log("CARGAR BASE NUEVA RRRRRRRRRR")
               const rescargar=await CargarBase()
               .then((resp)=>{
                
               setLoadingImport(false)
               })
               
               
            }
    
       

    }
    return (

        <IonPage>
            <IonContent className='content-border'>
                <IonGrid className='ion-align-items-center'>
                    <IonRow>
                        <IonCol className='col_logos' sizeSm='12' sizeXs='12' sizeLg='4' sizeXl='4'>
                            <img src={logoAdesar}></img>
                        </IonCol>
                        <IonCol className='col_logos' sizeSm='12' sizeXs='12' sizeLg='4' sizeXl='4'>
                            <img src={logoUnsada}></img>
                        </IonCol>
                        <IonCol className='col_logos' sizeSm='12' sizeXs='12' sizeLg='4' sizeXl='4'>
                            <img src={logoMundoSano}></img>
                        </IonCol>

                    </IonRow>
                    <IonRow >
                        <IonCol >

                            <div className='content-div'>


                            </div>
                            <IonButton expand='block' routerLink="/personas" color="secondary" className='button_css'>Continuar</IonButton>
                            {hayInternet&&<IonButton onClick={() => exportJson()} expand='block' color="secondary" className='button_css'>Exportar</IonButton>}
                           { /*<IonButton onClick={() => importJson()} expand='block' color="secondary" className='button_css'>Importar</IonButton>*/}
                           {hayInternet&&<IonButton onClick={() => nuevaBBDD()} expand='block' color="secondary" className='button_css' disabled={loadindImport}>{loadindImport?"Importando":"Importar"}</IonButton>}
                            {hiddenFecha && <IonItem onClick={() => exportJsontoApi()}>
                                <IonLabel className="ion-text-wrap">Tu ultima actualizacíon es del dia {moment(fechaActualizacion).format("YYYY-MM-DD")}</IonLabel>

                                {!loading && <IonIcon icon={downloadOutline} color={colorLogo ? "success" : "danger"}></IonIcon>}
                            </IonItem>}
                            <IonLoading message="Por favor esperar a que termine..." isOpen={loading} />
                        </IonCol>

                    </IonRow>


                </IonGrid>
            </IonContent>
        </IonPage>

    );
};

export default Main;