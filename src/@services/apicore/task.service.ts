
import { Injectable } from "@angular/core";
import { openDB } from "idb";


const dbPromise = openDB("sandrad-task", 1, {
  upgrade(db) {
    const task = db.createObjectStore("task", {
      // keyPath: "id",
      autoIncrement: true,
    });

    // task.createIndex("pid", "pid");
  },
});

export interface ITask {
  id : string;
  funcion: string;
  estatus: boolean;
  nombre: string;
  fin: Date;
  inicio: Date;
  prioridad: number;
  usuario: string;
}

@Injectable({
  providedIn: "root",
})
export class TaskService  {
  public iTask: ITask = {
    id: '',
    funcion: '',
    nombre: '',
    estatus: false,
    fin: undefined,
    inicio: undefined,
    prioridad: 0,
    usuario: '',
  };


  async get(key) {
    return (await dbPromise).get("task", key);
  }
  async set(key, val, app) {
    this.iTask.id = key
    this.iTask.inicio = new Date()
    this.iTask.funcion = val
    this.iTask.estatus = true
    this.iTask.nombre = app
  
    return (await dbPromise).put("task", this.iTask, key);


  }
   update(key) {
    this.get(key).then(
      async data  => {
        this.iTask = data;
        this.iTask.fin = new Date();
        this.iTask.estatus = false;

        (await dbPromise).put("task", this.iTask, key);
      }
    )
   

     


  }


  async del(key) {
    return (await dbPromise).delete("task", key);
  }
  async clear() {
    return (await dbPromise).clear("task");
  }
  async keys() {
    return (await dbPromise).getAllKeys("task");
  }


}
