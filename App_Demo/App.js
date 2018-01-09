/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Button,
  View,
  NativeModules
} from 'react-native';
import axios from 'axios';
import * as Wechat from 'react-native-wechat';

export default class App extends Component {

  _alipay = () => {
    var payAction = NativeModules.PayAction
    debugger
    axios.post('http://192.168.1.45:3000/alipay/pay').then(({ data }) => {
      return payAction.pay(data)
    }).then((res) => {
      alert(res)
      console.log(res)
    }).catch((err) => {
      alert(err)
      console.log(err)
    })

  }

  _wxpay = () => {
    Wechat.isWXAppInstalled().then((res) => {
      if (res) {
        axios.post('http://192.168.1.45:3000/wechat/pay').then(({ data }) => {
          return Wechat.pay(data)
        }).then((success) => {
          alert('Success pay')
        }).catch((err) => {
          console.log(err)
        })
      } else {
        alert('Not intalled wechat')
      }
    })
  }

  constructor(props) {
    super(props);
    Wechat.registerApp('')
  }



  render() {
    return (
      <View style={styles.container}>
        <View>
          <Button title=' Alipay 支付' onPress={this._alipay} style={styles.welcome} />

        </View>
        <View style={{ marginVertical: 40 }}>
          <Button title=' Wechat 支付' color='#00c853' onPress={this._wxpay} style={styles.instructions} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
    padding: 40,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    width: 200,
    marginVertical: 20,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    width: 200,
    marginVertical: 20,
  },
});
