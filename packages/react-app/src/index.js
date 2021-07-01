import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import "./index.css";
import App from "./App";
import Landing from "./components/Landing";
import { ChakraProvider } from "@chakra-ui/react";

// react-router
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/paulrberg/create-eth-app",
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <ChakraProvider>
      <Router>
        <Route exact path="/" component={Landing} />
        <Route exact path="/home" component={Landing} />
        <Route exact path="/App" component={App} />
      </Router>
    </ChakraProvider>
  </ApolloProvider>,
  document.getElementById("root")
);
