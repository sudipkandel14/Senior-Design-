import * as React from "react";  //!< Import React component for all react native functionalities
import { Text, View, StyleSheet, Button, Alert } from "react-native"; //!< Import various designing tools from react-native mainly for Styling
import Constants from "expo-constants";  //!< Import special api to save qrcode to Special constant
import * as Permissions from "expo-permissions"; //!< Importing permission certificate for camera access by application
import { Appbar } from "react-native-paper";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as firebase from "firebase"; //!< Import React component for all react native functionalities


/*!
 * \brief User can scan the generated QR code to look up their item in their shelf
 * \param name Name of the user
 * \param itemname name of item in the shelf
 * \param email Email of the user
 */

export default class ScanInventoryScreen extends React.Component {
  state = {
    hasCameraPermission: null,
    scanned: false,
    email:'',
    name:''
  };

  static navigationOptions = {
    title: 'barcode',
  };

  async componentDidMount() {
    firebase.auth().onAuthStateChanged(authenticate => {
      if (authenticate) {
        this.setState({
          email: authenticate.email,
          name: authenticate.displayName
        });
      }
    })
    this.getPermissionsAsync();
  }
    
  getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  };
  
  render() {
    const { hasCameraPermission, scanned } = this.state;
    const { navigate } = this.props.navigation;
    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
      <View style={styles.topContainer}>
      <Appbar.Header>
        <Appbar.Content title={this.state.name} subtitle={this.state.email} />
        <Appbar.BackAction onPress={() => {
                this.props.navigation.navigate("AddingItem")
            }} />
        <Appbar.Action icon="logout" onPress={this.signOutUser} />
      </Appbar.Header>
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        {scanned && (
            <Button
            title="Done"
            //Button Title
            onPress={() =>
             {}
            }></Button>
          )}
      </View>
      </View>
    );
  }

  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scanned: true });
     this.props.navigation.navigate('AddingItem', {
        Passeddata: data,
      })
  };
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#e6e7e8"
  },
})
