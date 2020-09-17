import axios, { AxiosResponse } from 'axios';
import { useEffect, useReducer, useState } from 'react';
var extend = require("extend");

const dataFetchReducer = (state, action) => {
    const debug = false;
    if (debug) {
        console.log(`dataFetchReducer incoming:`);
        console.log(action);
    }
    try {


        switch (action.type) {
            case 'FETCH_INIT':
                return {
                    ...state,
                    isLoading: true,
                    isError: false,
                    doneLoading: false
                };
            case 'FETCH_SUCCESS':
                delete state.error;
                if (debug){
                    console.log(`returning...`);
                    console.log({
                        ...state,
                        isLoading: false,
                        isError: false,
                        data: action.payload,
                        doneLoading: true
                    });
                }

                return {
                    ...state,
                    isLoading: false,
                    isError: false,
                    data: action.payload,
                    doneLoading: true
                };
            case 'FETCH_FAILURE':
                state.error = action.data || state.error;
                state.state = extend(true, {}, { state: { status: { val: 255, desc: 'Connection Error', name: 'error' } } });
                return {
                    ...state,
                    isLoading: false,
                    isError: true,
                    doneLoading: false
                };
            case 'UPDATE':
                if (typeof state.data === 'undefined') return state;
                state.isLoading = false;
                state.isError = false;
                state.doneLoading = true;
                switch (action.updateType) {
                    case 'REPLACE_ARRAY':
                        {
                            let _data = state.data;
                            if (Array.isArray(action.dataName)) {
                                action.dataName.forEach(el => {
                                    _data = _data[el];
                                });

                            }
                            else {
                                _data = state.data[action.dataName];
                            }
                            let index = _data.findIndex(el => {
                                return el.id === action.data.id;
                            });
                            if (index === -1) _data.push(action.data);
                            else _data[index] = action.data;
                            return { ...state };
                        }

                    case 'MERGE_OBJECT':
                        {
                            if (debug) {
                                console.log(`Merge (object):`);
                                console.log(action.data);
                                console.log(`to:`);
                                console.log(state.data[action.dataName]);
                            }
                            // Object.assign(state.data[action.dataName][index], action.data);
                            let res = extend(true, {}, state.data[action.dataName], action.data);
                            if (debug) {
                                console.log(`result:`);
                                console.log(res);
                                console.log(`compare`);
                                console.log(state);
                            }
                            state.data[action.dataName] = res;
                            return { ...state };
                        }
                    case 'MERGE_ARRAY':
                        {
                            if (Array.isArray(action.dataName)) {
                                if (debug) {
                                    console.log(`Merge Deep (array):`);
                                    console.log(action.data);
                                    console.log(`to:`);
                                }
                                let d = state.data;
                                for (let i = 0; i < action.dataName.length; i++) {
                                    d = d[action.dataName[i]];
                                }
                                let index = d.findIndex(el => {
                                    return el.id === action.data.id;
                                });
                                if (debug) console.log(d[index]);
                                // Object.assign(state.data[action.dataName][index], action.data);
                                let res = extend(true, {}, d[index], action.data);
                                if (debug) {
                                    console.log(`result:`);
                                    console.log(res);
                                    console.log(`compare`);
                                    console.log(state);
                                }
                                if (index === -1) {
                                    d.push(res);
                                }
                                else {
                                    d[index] = res;
                                }
                                if (debug) console.log(state);
                                return { ...state };
                            }
                            else {
                                if (debug) {
                                    console.log(`state...`);
                                    console.log(state);
                                }
                                let index = state.data[action.dataName].findIndex(el => {
                                    return el.id === action.data.id;
                                });
                                if (debug) {
                                    console.log(`merge (array):`);
                                    console.log(action.data);
                                    console.log(`to:`);
                                    console.log(state.data[action.dataName][index]);
                                    console.log(`at position (index): ${index}`);
                                }
                                // Object.assign(state.data[action.dataName][index], action.data);
                                let res = extend(true, {}, state.data[action.dataName][index], action.data);
                                if (index === -1) {
                                    state.data[action.dataName].push(res);
                                }
                                else {
                                    state.data[action.dataName][index] = res;
                                }
                                if (debug) {
                                    console.log(`returning...`);
                                    console.log(state);
                                }
                                return { ...state };
                            }
                        }

                    case 'REPLACE':
                        {
                            // used to completely replace an object (object is modified on the local component)
                            // eg used in Chem Controllers to add/remove one.  This wouldn't work with the other methods
                            if (Array.isArray(action.dataName)) {
                                let d = state.data;
                                for (let i = 0; i < action.dataName.length; i++) {
                                    d = d[action.dataName[i]];
                                }
                                // if we replace the array with another array we replace the reference,
                                // so need to empty out the original and push the new.
                                if (Array.isArray(d)) {

                                    let len = d.length;
                                    d.splice(0, len);
                                    for (let i = 0; i < action.data.length; i++) {
                                        d.push(action.data[i]);
                                    }
                                }
                                else d = action.data;
                                return { ...state };
                            }
                            else if (typeof action.dataName !== 'undefined') state.data[action.dataName] = action.data
                            else state.data = action.data;
                            return { ...state };
                        }
                    case 'EXTEND':
                        console.log(`type of update=extend; with data: ${JSON.stringify(action.data)}`);
                        break;

                    default:
                        throw new Error(`Missing action.updateType ${action.updateType}`);
                }
                break;
            default:
                throw new Error(`Missing action.type ${action.type}`);
        }
    }
    catch (err) {
        console.log(`----- BEGIN ERROR MESSAGE -------`);
        console.log(`Error in data fetch API executing ${action.dataName}`)
        console.log(err);
        console.log(`on`)
        console.log(state);
        console.log(`with incoming`);
        console.log(action);
        console.log(`------ END ERROR MESSAGE --------`);
        return { ...state };
    }
};
const useDataApi = (initialUrls, initialData) => {
    const debug = false;
    const [urls, setUrls] = useState(initialUrls);


    const [state, dispatch] = useReducer(dataFetchReducer, {
        isLoading: false,
        isError: false,
        doneLoading: false,
        data: initialData
    });

    const setUpdates = (action: { updateType: string, data: any; }) => {
        switch (action.updateType) {
            case 'FETCH_FAILURE':
                dispatch({ type: 'FETCH_FAILURE' });
                break;
            default:
                dispatch({ type: 'UPDATE', ...action });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_INIT' });
            try {
                if (typeof urls === 'undefined') return;
                let fetchArray = [];
                let payload = {};
                urls.forEach(el => {
                    if (debug) {
                        console.log(`fetching: ${el.url}`);
                        console.log(`url: ${el.url}`)
                        if (el.url.startsWith('undefined')) {
                            console.log(`UNDEFINED URL!  ${el.url}`)
                        }
                    }
                    fetchArray.push(axios(el.url));
                });
                if (fetchArray.length > 0) {
                    let responseArr: AxiosResponse[] = await axios.all(fetchArray);
                    for (let i = 0; i < responseArr.length; i++) {


                        if (typeof responseArr[i].data === 'string' && responseArr[i].data.startsWith('<!DOC')) {
                            console.log(`<!DOC!`);
                            throw new Error(`Unable to retrieve data at ${urls[i].url}.`);
                        }


                        if (typeof urls[i].dataName === 'undefined') {
                            payload = Object.assign(true, {}, payload, responseArr[i].data);
                        }
                        else {
                            payload[urls[i].dataName] = responseArr[i].data;
                        }
                    }
                    dispatch({ type: 'FETCH_SUCCESS', payload });
                }
            }
            catch (error) {
                console.log(`Not able to retrieve data.`);
                console.log(error);
                dispatch({ type: 'FETCH_FAILURE', data: `${error.message}` });
            }
        };
        fetchData();
    }, [urls]);



    return [state, setUrls, setUpdates];
};

export default useDataApi;