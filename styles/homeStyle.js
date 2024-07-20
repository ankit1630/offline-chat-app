import { StyleSheet } from 'react-native';

export const homeStyles = StyleSheet.create({
    mainContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginBottom: 8,
        flex: 1,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 12,
        padding: 12
    },
    headerText: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 12
    },
    description: {
        fontWeight: '200',
        fontFamily: 'Noto Sans',
        textAlign: 'justify'
    },
    listStyle: {
        marginTop: 20,
        flexGrow: 'unset',
        position: 'relative',
        overflow: 'scroll'
    },
    listStyleItem: {
        paddingLeft: 0,
        textAlign: 'left',
        alignSelf: 'flex-start',
        borderRadius: 12
    },
    chatSendBtn: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 60
    }
});