import React, { Component } from 'react';
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
    ScrollView,
    AsyncStorage,
    ToastAndroid,
    Dimensions,
} from 'react-native';
import { Icon, SearchBar } from 'react-native-elements';
import Tts from 'react-native-tts';
import WebResult,{ get_webresults } from './WebResult';
import {
    SpeechRecognizer,
    RecognizerIntent,
    RecognitionListener,
} from 'react-native-android-speech-recognizer';

const { width } = Dimensions.get('window');
const recognise = options =>
new Promise(async (resolve, reject) => {
    const available = await SpeechRecognizer.isRecognitionAvailable();
if (!available) {
    reject('not available');
}
const recognizer = await SpeechRecognizer.createSpeechRecognizer();
recognizer.setRecognitionListener({
    onError: event => reject('Failed with error code: ' + event.error),
    onResults: event => {
    const recognition = event.results[SpeechRecognizer.RESULTS_RECOGNITION];
    const bestRecognition = recognition[0];
    resolve(bestRecognition);
},
});
recognizer.startListening(RecognizerIntent.ACTION_RECOGNIZE_SPEECH, {});
});

export default class App extends Component<{}> {
    constructor(props) {
        super(props);
        Tts.setDucking(true);
        this.state = {
            text: [],
            fetching: false,
            listening: false,
            key: '',
        };
    }

    get_speech() {
        this.setState({ listening: true });
        recognise()
            .then(bestRecognition => {
            console.log('recognised:', resultTextToEvent(bestRecognition));
    })
    .catch(error => {
            console.log('error:', error);
    });
        this.setState({ listening: false });
    }

    web_search=(text)=>{
        get_webresults(text)
            .then(text => text.json())
    .then(textjson =>
        this.setState({
            text: [...this.state.text, 'web+++$+++' + JSON.stringify(textjson)],
        fetching: false,
    }),
    )
    .catch(e => {console.log(e);this.setState({ fetching: false })});
    };

    get_response = text => {
        if (text)
            this.setState({ fetching: true });
        url = 'https://chatbot11298.herokuapp.com/get?msg=' + text;
        fetch(url)
            .then(result => result._bodyText)
    .then(responseData => {
            Tts.speak(responseData);
        this.setState({
            text: [...this.state.text, 'bot+++$+++' + responseData],
        fetching: false,
    });
        if (responseData === "I'm sorry, I do not know that!") {
            this.setState({
                text: [...this.state.text, 'bot+++$+++Let me search the internet'],
            fetching: true,
        });
            this.web_search(text);
        }
    })
    .catch(e => {
            console.log(e);
        this.setState({ fetching: false });
    });
        Tts.stop();
    };

    componentWillMount() {
      this.get_response('How are you?');
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
    <Image
        source={require('./assets/bg3.jpg')}
        style={styles.image}
        ref={'backgroundImage'}
        />
        <ScrollView
        style={{ height: '75%' }}
        contnentStyle={{ flexDirection: 'row' }}
    >
    <View style={styles.bot}>
    <Text style={styles.text}>{'Hello! My name is Nora'}</Text>
        </View>
        {this.state.text.map((content, index) => {
            data = content.split('+++$+++');
            if (data[0] === 'user') {
                return (
                    <View style={styles.user} key={index}>
                    <Text style={styles.text}>{data[1]}</Text>
                </View>
            );
            } else if (data[0] === 'bot'){
                return (
                    <View style={styles.bot} key={index}>
                    <Text style={styles.text}>{data[1]}</Text>
                </View>
            );
            } else if (data[0] === 'web') {
            <WebResult data={data[1]}/>
            }
        })}
        {this.state.fetching && (
        <View style={styles.bot}>
        <Text style={styles.text}>Typing</Text>
        </View>
        )}
    </ScrollView>
        <View
        style={{
            bottom: 0,
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
        }}
    >
    <Icon
        raised={this.state.listening}
        name={'mic'}
        size={40}
        type={'feather'}
        color={(this.state.listening && 'black') || 'white'}
        onPress={this.get_speech}
        />
        <SearchBar
        width={width - 10}
        lightTheme
        onChangeText={text => this.setState({ key: text })}
        onClearText={() => this.setState({ key: '' })}
        placeholder="Type Here..."
        value={this.state.key}
        onSubmitEditing={() => {
            this.setState({
                text: [...this.state.text, 'user+++$+++' + this.state.key],
        });
            this.get_response(this.state.key);
            this.setState({ key: '' });
        }}
        />
        </View>
        </View>
    );
    }
}

const styles = StyleSheet.create({
    user: {
        flex: 1,
        alignItems: 'flex-end',
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginVertical: 5,
        paddingHorizontal: 5,
    },
    bot: {
        flex: 1,
        alignItems: 'flex-start',
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginVertical: 5,
        paddingHorizontal: 5,
    },
    text: {
        fontSize: 20,
        color: 'white',
    },
    image: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        resizeMode: 'cover',
        width: null,
        height: null,
    },
});
