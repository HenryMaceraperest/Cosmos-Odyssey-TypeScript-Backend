"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const weightedGraph_1 = __importDefault(require("../utils/weightedGraph"));
const APIToFetch = 'https://cosmos-odyssey.azurewebsites.net/api/v1.0/TravelPrices';
function getSearchResult(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // create a directional graph
            let graph = new weightedGraph_1.default();
            // get data from api
            const apiResponse = yield axios_1.default.get(APIToFetch);
            // select the appropriate data
            const result = apiResponse.data.legs;
            // starting data structures - 'array' for all edges + later to filter appropriate results based on flight id's returned by Dijkstra's algorithm, 'vertexes' for all unique vertexes, 'finalResult' for Dijkstra's responses, 'response' for the res.json response, after filtering the according flights from the edge's array 
            const array = [];
            const vertexes = [];
            const finalResult = [];
            const response = [];
            const from = req.query.from;
            const to = req.query.to;
            const date = req.query.date;
            // push unique vertexes into 'vertexes' && push all edges into 'array'
            for (let w of result) {
                if (!vertexes.includes(w.routeInfo.from.name)) {
                    vertexes.push(w.routeInfo.from.name);
                }
                ;
                if (!vertexes.includes(w.routeInfo.to.name)) {
                    vertexes.push(w.routeInfo.to.name);
                }
                ;
                for (let y of w.providers) {
                    array.push(y),
                        (y.from = w.routeInfo.from.name),
                        (y.to = w.routeInfo.to.name),
                        (y.distance = w.routeInfo.distance);
                }
            }
            ;
            // add all vertexes to digraph
            for (let vertex of vertexes) {
                graph.addVertex(vertex);
            }
            ;
            // add all edges to digraph
            for (let edge of array) {
                graph.addEdge(edge.from, edge.to, edge.flightStart, edge.flightEnd, edge.id);
            }
            ;
            // if date variable is present, find out how many possible edges with the responding date are available from the starting vertex
            if (date) {
                let possibleLength = graph.adjacencyList[from].map(el => new Date(el.startDate).toISOString().split('T')[0] === date);
                // for each of the possibility, run Dijkstra's algorithm 
                // if the returned array is not empty, push into the final array (this has only from, to, and flight id properties), and remove the starting edge
                for (let i = 0; i <= possibleLength.length; i++) {
                    const returnedArray = graph.Dijkstra(from, to, date);
                    if (returnedArray.length > 0) {
                        finalResult.push(returnedArray);
                        graph.removeEdge(from, returnedArray[0].flight_id);
                    }
                }
            }
            else {
                // if date is not present, find all the flights that go from the starting vertex
                let possibleLength = graph.adjacencyList[from];
                // for each possibility, run the allPaths function (which is basically Dijkstra's algorithm without the starting date aspect), to find all possible connections to the end vertex 
                for (let i = 0; i <= possibleLength.length; i++) {
                    const returnedArray = graph.allPaths(from, to);
                    if (returnedArray.length > 0) {
                        finalResult.push(returnedArray);
                        graph.removeEdge(from, returnedArray[0].flight_id);
                    }
                }
            }
            // filter through all Dijkstra's responses, and return nested array with all the matching data
            for (let a of finalResult) {
                const responseArray = [];
                for (let b of a) {
                    const result = array.filter(element => element.id === b.flight_id);
                    responseArray.push(result[0]);
                }
                response.push(responseArray);
            }
            // return the results 
            res.json(response);
        }
        catch (err) {
            console.log('Error in the general try-catch', err);
        }
    });
}
;
exports.default = { getSearchResult };
