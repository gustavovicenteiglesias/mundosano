

import { sqlite, existingConn, db } from "../App"
import { SQLiteDBConnection } from "react-sqlite-hook";
import { minimo,maximo } from "../utils/constantes";
import { Usuarios } from "../models/Usuarios";


const dbdb = async () => {
  const ret = await sqlite.checkConnectionsConsistency();
  const isConn = (await sqlite.isConnection("triplefrontera")).result;
  var db: SQLiteDBConnection
  if (ret.result && isConn) {
    return db = await sqlite.retrieveConnection("triplefrontera");
  } else {
    return db = await sqlite.createConnection("triplefrontera");
  }
}

export class UsuariosRepo{
    async getUsuarioByNombre(nombre:string):Promise<Usuarios[]> {
        const db = await dbdb()
        await db.open()
        const res = await db.query(`SELECT * FROM usuarios WHERE usuario="${nombre}"`);
        await db.close()

        //console.log("Ubicaciones "+JSON.stringify(res.values))
        return res.values as Usuarios[]

    }
   
}