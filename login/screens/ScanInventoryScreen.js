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
    email: "",
    name: "",
    itemname: "",
    searchText: "",
    temp: ""
  };

  static navigationOptions = {
    title: "ScanInventory",
    header: null
  };
  async componentDidMount() {
    firebase.auth().onAuthStateChanged(authenticate => {
      if (authenticate) {
        this.setState({
          email: authenticate.email,
          name: authenticate.displayName
        });
      }
    });
    this.getPermissionsAsync();
  }

  getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  };
  goHome = () => {};
  search = searchText => {
    var user = firebase.auth().currentUser;
    var uid,
      j = 0;

    if (user != null) {
      uid = user.uid;
    }
    var itemref = firebase.database().ref("item_added");
    var locationref = firebase.database().ref("allocated_space");

    itemref.once("value", dataSnapShot => {
      if (dataSnapShot.val()) {
        let dobobj = Object.values(dataSnapShot.val());
        let keyobj = Object.keys(dataSnapShot.val());
        for (var i = 0; i < dataSnapShot.numChildren(); i++) {
          if (keyobj[i] == searchText && dobobj[i].uid == uid) {
            j++;
            this.setState({
              temp: dobobj[i].location,
              itemname: dobobj[i].itemName
            });
          }
        }
        if (j == 0) {
          Alert.alert(" No Such item Found ");
        }
      }
    });
    locationref.once("value", dataSnapShot => {
      if (dataSnapShot.val()) {
        let dobobj = Object.values(dataSnapShot.val());
        let keyobj = Object.keys(dataSnapShot.val());
        for (var i = 0; i < dataSnapShot.numChildren(); i++) {
          if (keyobj[i] == this.state.temp) {
            Alert.alert(
              this.state.itemname + " is on ",
              " Row = " +
                dobobj[i].Row +
                " and Column = " +
                dobobj[i].Column +
                " at " +
                dobobj[i].location
            );
          }
        }
      }
    });
  };

  render() {
    const { hasCameraPermission, scanned } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
      <View style={styles.topContainer}>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
              this.props.navigation.navigate("Home");
            }}
          />
          <Appbar.Content title={this.state.name} subtitle={this.state.email} />
          <Appbar.Action icon="logout" onPress={this.signOutUser} />
        </Appbar.Header>
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "flex-end"
          }}
        >
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />

          {scanned && (
            <Button
              title={"Tap to Scan Again"}
              onPress={() => this.setState({ scanned: false })}
            />
          )}
          {scanned && (
            <Button
              title={"Done"}
              onPress={() => {
                this.props.navigation.navigate("Home");
              }}
            />
          )}
        </View>
      </View>
    );
  }

  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scanned: true });
    //alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    this.search(data);
  };
}

const styles = StyleSheet.create({
  topContainer: {
    backgroundColor: "#393636",
    flex: 1,
    flexDirection: "column",

  }
});//!< Controls various styling for the application
