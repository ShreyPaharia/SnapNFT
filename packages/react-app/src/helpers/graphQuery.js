import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const graphQuery = async (apiUrl, gQuery) => {


const client = new ApolloClient({
  uri: apiUrl,
  cache: new InMemoryCache()
});

const data = client.query({
  query: gql(gQuery)
})

return data;
// .then(data => {
//   console.log("Subgraph data: ", data);
//   return data;
// })
// .catch(err => { 
//   console.log("Error fetching data: ", err) ;
//   return 0;
// });
}

export default graphQuery;