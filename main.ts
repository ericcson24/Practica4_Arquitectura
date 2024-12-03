import { MongoClient, ObjectId } from "mongodb";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

//-----------------------------------------------------------------------------------------------------------------------------\\

// Conexiones a la base de datos


const client = new MongoClient("mongodb+srv://usuario:1234@cluster.il6dy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster");

await client.connect();
console.log("Conectado correctamente a la base de datos");

// Base de datos y colecciones
const db = client.db("tiendaRepuestos");
const vehicleCollection = db.collection("vehiculos");
const partCollection = db.collection("parts");

console.log("Base de datos activa"); 

//-----------------------------------------------------------------------------------------------------------------------------\\

// Esquema de GraphQL

const typeDefs = `#graphql
  type Vehicle {
    id: String!
    name: String!
    manufacturer: String!
    year: Int!
    parts: [Part!]!
    joke: String
  }

  type Part {
    id: String!
    name: String!
    price: Float!
    vehicleId: String!
  }

  type Query {
    vehicles(manufacturer: String): [Vehicle!]!
    vehicle(id: String!): Vehicle
    parts: [Part!]!
    partsByVehicle(vehicleId: String!): [Part!]!
  }

  type Mutation {
    addVehicle(name: String!, manufacturer: String!, year: Int!): Vehicle!
    addPart(name: String!, price: Float!, vehicleId: String!): Part!
  }
`;

//-----------------------------------------------------------------------------------------------------------------------------\\

// Resolvers

const resolvers = {
  Query: {
    vehicles: async (_: unknown, args: { manufacturer?: string }) => {
      const query = args.manufacturer ? { manufacturer: args.manufacturer } : {};
      const vehicles = await vehicleCollection.find(query).toArray();

      return vehicles.map(async (v) => ({
        id: v._id.toString(),
        name: v.name,
        manufacturer: v.manufacturer,
        year: v.year,
        parts: await partCollection.find({ vehicleId: v._id }).toArray(),
        joke: await fetch("https://official-joke-api.appspot.com/random_joke")
          .then((res) => res.json())
          .then((joke) => `${joke.setup} - ${joke.punchline}`),
      }));
    },

    vehicle: async (_: unknown, args: { id: string }) => {
      const vehicle = await vehicleCollection.findOne({ _id: new ObjectId(args.id) });
      if (!vehicle) return undefined;

      const parts = await partCollection.find({ vehicleId: vehicle._id }).toArray();
      const joke = await fetch("https://official-joke-api.appspot.com/random_joke")
        .then((res) => res.json())
        .then((joke) => `${joke.setup} - ${joke.punchline}`);

      return {
        id: vehicle._id.toString(),
        name: vehicle.name,
        manufacturer: vehicle.manufacturer,
        year: vehicle.year,
        parts,
        joke,
      };
    },

    parts: async () => {
      const parts = await partCollection.find().toArray();
      return parts.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        price: p.price,
        vehicleId: p.vehicleId.toString(),
      }));
    },

    partsByVehicle: async (_: unknown, args: { vehicleId: string }) => {
      const parts = await partCollection.find({ vehicleId: new ObjectId(args.vehicleId) }).toArray();
      return parts.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        price: p.price,
        vehicleId: p.vehicleId.toString(),
      }));
    },
  },

  Mutation: {
    addVehicle: async (_: unknown, args: { name: string; manufacturer: string; year: number }) => {
      const { insertedId } = await vehicleCollection.insertOne({
        name: args.name,
        manufacturer: args.manufacturer,
        year: args.year,
      });

      return {
        id: insertedId.toString(),
        name: args.name,
        manufacturer: args.manufacturer,
        year: args.year,
        parts: [],
        joke: "",
      };
    },

    addPart: async (_: unknown, args: { name: string; price: number; vehicleId: string }) => {
      const { insertedId } = await partCollection.insertOne({
        name: args.name,
        price: args.price,
        vehicleId: new ObjectId(args.vehicleId),
      });

      return {
        id: insertedId.toString(),
        name: args.name,
        price: args.price,
        vehicleId: args.vehicleId,
      };
    },
  },
};

//-----------------------------------------------------------------------------------------------------------------------------\\

// Arranque del servidor

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });

console.log(`🚀  Server ready at: ${url}`);
