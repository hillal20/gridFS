import React, { Component } from "react";
import "./App.css";
import axios from "axios";
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: "",
      dataBaseFile: ""
    };
  }
  componentWillMount() {
    this.sendFile();
  }

  eventHandler = event => {
    this.setState({ file: event.target.files[0] });
  };
  sendFile = () => {
    const data = new FormData();
    data.append("image", this.state.file);
    console.log("data===>", data.get("image"));
    const promise = axios.post("http://localhost:4005/uploads", data, {
      onUploadProgress: progressEvent => {
        console.log(
          "progress==>",
          Math.round((progressEvent.loaded / progressEvent.total) * 100),
          "%"
        );
      }
    });
    promise
      .then(res => {
        console.log("res====> ", res.data);
        this.setState({ dataBaseFile: res.data });
      })
      .catch(err => {
        console.log(err);
      });
  };
  render() {
    console.log("this.state.file===>", this.state.file);
    console.log("this.state.dataBaseFile===>", this.state.dataBaseFile.file);
    return (
      <div className="App">
        <h3>upload your picture</h3>
        <input type="file" name="file" onChange={this.eventHandler} />
        <button onClick={this.sendFile}>send</button>
        <img
          src="http://localhost:4005/image/54ce993a7bb1bf4798ae62edb563a3ac.jpg"
          width="400"
        />
      </div>
    );
  }
}

export default App;
