import React from 'react';
import NewDoc from './NewDoc';
import SharedDoc from './SharedDoc';
import axios from 'axios';
import { Link } from 'react-router-DOM';
import * as colors from 'material-ui/styles/colors';
import RaisedButton from 'material-ui/RaisedButton';

class MyDocuments extends React.Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   docs: []
    // };
  }

  // componentDidMount(){
  //   console.log("Inside MyDocuments componentDidMount");
  //   axios.get('http://localhost:3000/documents')
  //   .then((docs)=>{
  //     this.setState({
  //       docs: this.state.docs.concat(docs.data),
  //     });
  //   });
  // }

  render(){
    console.log(this.props);
    return(
      <div className = 'container'>
        <h3> My Documents </h3>
        <ul>
          {this.props.files ?
            this.props.files.map((doc)=>{return(
              <li key = {doc._id}><Link to = {`/editor/${this.props.user}/${doc._id}`}>
              {doc.title}</Link></li>);}) :
            <div>You don't have any documents yet.</div>
           }
      </ul>
      <h3> My Shared Documents</h3>
      <ul>
        {this.props.sharedDoc ?
          this.props.sharedDoc.map((doc)=>{return(
            <li key = {doc._id}><Link to = {`/editor/${this.props.user}/${doc._id}`}>
            {doc.title}</Link></li>);}) :
        <div>You don't have any shared documents.</div>
        }
    </ul>
      </div>
    );
  }
}

class DocumentPortal extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      files: [],
      sharedDoc: [],
      user: ''
    };
  }

  componentDidMount(){
    console.log("Inside componentDidMount");
    axios.post('http://localhost:3000/getAllDocs', {
      userid: this.props.match.params.userid
    })
      .then((response) =>{
        this.setState({
          files: response.data.ownDoc,
          sharedDoc: response.data.sharedDoc,
          user: this.props.match.params.userid
        });
      })
      .catch(err=>console.log(err));
  }


  logout(){
    axios.get('http://localhost:3000/logout')
    .then((resp) => {
      this.props.history.replace('/');
    })
    .catch(err => console.log(err));
  }
  render() {
    return (
      <div>
        <h3>Document Portal</h3>
        CurrentUser: {this.props.match.params.userid}
        <h6>Welcome!</h6>
        <NewDoc history={this.props.history} user = {this.state.user}/>
        <MyDocuments files = {this.state.files} sharedDoc = {this.state.sharedDoc} user = {this.props.match.params.userid} />
        <SharedDoc history={this.props.history} user = {this.props.match.params.userid}/>
        <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column', margin: '20'}}>
        <RaisedButton
          label="Logout"
          onClick={this.logout.bind(this)}
          backgroundColor = {String(colors.gray200)}
        />
        </div>
      </div>
    );
  }
}
export default DocumentPortal;
