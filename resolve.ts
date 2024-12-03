import { Vehicle, VehicleModel, Part, PartModel } from "./types.ts";


export const transformVehicle = (vehicle: VehicleModel, parts: Part[] = []): Vehicle => ({
  id: vehicle._id.toString(),
  name: vehicle.name,
  manufacturer: vehicle.manufacturer,
  year: vehicle.year,
  parts,
});


export const transformPart = (part: PartModel): Part => ({
  id: part._id.toString(),
  name: part.name,
  price: part.price,
  vehicleId: part.vehicleId.toString(),
});
