import React from 'react'
import {View,Text,StyleSheet} from 'react-native'

export const get_webresults=(q)=>{
    q=q.trim().split(" ").join("+");
    console.log(q);
    return fetch('https://api.duckduckgo.com/?q='+ q +'&format=json');
};
export default class WebResult extends React.Component{
    constructor(props){
        super(props);
        this.state={
            data:this.props.data.json()
        }
    }

    render(){
        console.log(this.state.data);
        return (
            <Text>Hi</Text>
        )
    }
}
