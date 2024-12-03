import { ObjectId } from "mongodb";

export interface Vehicle {
  id: string; // ID del vehículo como cadena
  name: string; // Nombre del vehículo
  manufacturer: string; 
  year: number; 
  parts?: Part[]; // Lista de partes asociadas
  joke?: string; // Broma aleatoria para mostrar
}

export interface Part {
  id: string; 
  name: string; 
  price: number; 
  vehicleId: string; 
}

export interface VehicleModel {
  _id: ObjectId; 
  name: string; 
  manufacturer: string; 
  year: number; 
}

export interface PartModel {
  _id: ObjectId; 
  name: string; 
  price: number; 
  vehicleId: ObjectId; // ID del vehículo asociado en MongoDB
}
