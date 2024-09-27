import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, FlatList, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Kauppalista() {

  const [tuote, setTuote] = useState('');
  const [maara, setMaara] = useState('');
  const [tuotteet, setTuotteet] = useState([]);
  const [valitutTuotteet, setValitutTuotteet] = useState({});

  useEffect(() => {
    haeTuotteet();
  }, []);

  const haeTuotteet = async () => {
    try {
      const tallennetutTuotteet = await AsyncStorage.getItem('kauppaLista');
      if (tallennetutTuotteet !== null) {
        setTuotteet(JSON.parse(tallennetutTuotteet));
      }
    } catch (error) {
      Alert.alert('Tuotteiden lataaminen epäonnistui');
    }
  };

  const lisaaJaTallennaTuote = async () => {
    if (tuote === '' || maara === '') {
      Alert.alert('Täytä molemmat kentät');
      return;
    }

    const uusiTuote = { tuote, maara, key: Date.now().toString() };
    const uusiTuotelista = [...tuotteet, uusiTuote]; 
    setTuotteet(uusiTuotelista);
    setTuote('');
    setMaara('');

    try {
      await AsyncStorage.setItem('kauppaLista', JSON.stringify(uusiTuotelista));
    } catch (error) {
      Alert.alert('Tallennus epäonnistui');
    }
  };

  const poistaValitutTuotteet = async () => {
    const tuotteetSuodatus = tuotteet.filter(item => !valitutTuotteet[item.key]);
    setTuotteet(tuotteetSuodatus);
    setValitutTuotteet({});

    try {
      await AsyncStorage.setItem('kauppaLista', JSON.stringify(tuotteetSuodatus));
    } catch (error) {
      Alert.alert('Poistaminen epäonnistui');
    }
  };

  const toggleSwitch = (key) => {
    setValitutTuotteet(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kauppalista</Text>
      <View> 
        <TextInput style={styles.input}
          value={tuote}
          onChangeText={text => setTuote(text)}
          placeholder='Tuote'
        />      
        <TextInput style={styles.input}
          placeholder='Määrä'
          value={maara}
          onChangeText={text => setMaara(text)}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={lisaaJaTallennaTuote}>
        <Text style={styles.buttonText}>Lisää tuote</Text>
      </TouchableOpacity>

      {tuotteet.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Ei tuotteita lisätty</Text>
        </View>
      ) : (
        <FlatList
          data={tuotteet}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.itemText}>{item.tuote} - <Text style={styles.itemQuantity}>Määrä: {item.maara}</Text></Text>
              <Switch
                value={!!valitutTuotteet[item.key]}
                onValueChange={() => toggleSwitch(item.key)}
              />
            </View>
          )}
        />
      )}
      
      {tuotteet.length > 0 && (
        <TouchableOpacity style={styles.deleteSelectedButton} onPress={poistaValitutTuotteet}>
          <Text style={styles.deleteButtonText}>Poista</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2E8BC0',
    marginTop: 30,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20, 
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
  },
  input: {
    textAlign: 'center',
    fontSize: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 15,
    padding: 5,
    width: 250,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: '100%',
  },
  itemText: {
    fontSize: 18,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 16,
    color: '#777',
  },
  deleteSelectedButton: {
    backgroundColor: '#FF6347',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    position: 'absolute',
    top: 10,
    right: 20,
  },
  deleteButtonText: {
    fontSize: 16,
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    color: '#999',
  },
});
