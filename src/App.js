import React, { Component } from "react";
import { authEndpoint, clientId, redirectUri, scopes } from "./config";
import hash from "./hash";

import Buttons from './components/Buttons';


import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      token: null,
      tracks: [],
      data: false,
      timeRange: null
    };

  }

 
  componentDidMount() {
    let storedToken = localStorage.getItem('token');
    //Parse stored token
    let parsedToken = JSON.parse(storedToken)

    //If there is a token in local storage, save it to the state on mount or reload
    if (storedToken) {
      this.setState({ token: parsedToken.value })
    } 

    //If there is not a stored token, get it from the hash
    if (!storedToken) {
    let _token = hash.access_token;
    
    if (_token) {
      // Set the hash token to the state
      this.setState({
        token: _token
      });
    //Make the token expire in local storage before it expires on Spotify's end  
    this.setWithExpiry('token', _token, 3300000)
    }
    }
      
  }

  componentDidUpdate() {
    if (this.getWithExpiry('token') === false) {
      localStorage.removeItem('token');
      alert('Your session expired, please login again')
      this.setState({
        token: null,
        timeRange: null
      })

    }
  }

  setWithExpiry = (key, value, ttl) => {
    const now = new Date()
  
    // `item` is an object which contains the original value
    // as well as the time when it's supposed to expire
    const item = {
      value: value,
      expiry: now.getTime() + ttl,
    }
    localStorage.setItem(key, JSON.stringify(item))
  }

  getWithExpiry = (key) => {
    const itemStr = localStorage.getItem(key)
    // if the item doesn't exist, return null
    if (!itemStr) {
      return null
    }
    const item = JSON.parse(itemStr)
    const now = new Date()
    // compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
      // If the item is expired, delete the item from storage
      // and return false
      localStorage.removeItem(key)
      return false
    }
    return item.value
  }

  getTopTracks = (token) => {
    //Make API call with token, with timeRange from state
    fetch(`https://api.spotify.com/v1/me/top/tracks?limit=20&${this.state.timeRange}`, {
      type: 'GET',
      headers: {'Authorization': 'Bearer ' + token},
    }).then(response => response.json())
      .then((data) => {
        return data.items
      })
      // Store only the data we need from the endpoint in the items state array
      .then(items => items.map((item  => {
        let newObj = {}
        newObj["song"] = item.name
        newObj["artist"] = item.artists.length <= 1 ? item.artists[0].name: item.artists[0].name + ' & ' + item.artists[1].name
        newObj["preview"] = new Audio(item.preview_url)
        newObj["image"] = item.album.images[0].url
        return newObj
      })))
      // Setting data to true ensures there is something in the tracks state before we try to render from it
      .then((names) => {
        this.setState({
          data:true,
          tracks: names
        })
      })
   
    }

  // For these functions, pass a callback to second argument of setState so timeRange is updated before making the API call again
  allTime = () => {
    this.setState({
      timeRange: 'time_range=long_term'
    }, () => this.getTopTracks(this.state.token));
    
  }

  mediumTerm = () => {
    this.setState({
      timeRange: 'time_range=medium_term'
    }, () => this.getTopTracks(this.state.token));
  }

  shortTerm = () => {
    this.setState({
      timeRange: 'time_range=short_term'
    }, () => this.getTopTracks(this.state.token));
  }

  
    
  render() {
    return (
      <div className="App">
        <main className="wrapper">
          
          {!this.state.token && (
            <a
              className="btn btn--loginApp-link"
              href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
                "%20"
              )}&response_type=token&show_dialog=true`}
            >
              Login to Spotify
            </a>
          )}
          {this.state.token && !this.state.data && (
           <div className="wrapper__inner">
            <p>See Your Most Played Tracks From...</p> 
           <Buttons allTime={this.allTime} mediumTerm={this.mediumTerm} shortTerm={this.shortTerm} />
           </div>
            
          )}
           {this.state.token && this.state.data && (
             
            
            <div className="wrapper__inner">
              <p>See Your Most Played Tracks From...</p> 
              <Buttons allTime={this.allTime} mediumTerm={this.mediumTerm} shortTerm={this.shortTerm} />
              {this.state.tracks.map((track) => {
                return <img 
                key={track.name}
                onMouseEnter={() => track.preview.play()} onMouseLeave={() => track.preview.pause()}className="album" src={track.image} alt=""/>
              })}
            </div>
           
          )}
         
        </main>
       
      </div>
    );
  }
}

export default App;
