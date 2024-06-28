import React, { useState, useEffect } from "react";
import "./App.css";
// import Input from '@mui/material/Input';

import moment from 'moment';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';

import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import SyncIcon from '@mui/icons-material/Sync';
import FormLabel from '@mui/material/FormLabel';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'; //BarChart, Bar,  Legend,
import apiClient from "./http-common";
import { Switch } from "@mui/material";
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';


function App() {

  const [getStatsResult, setStatsResult] = useState(null);
  const [dataStore, setDataStore] = useState(new Map());
  const [viewItems, setViewItems] = useState([]);  // list of data views from the server
  const [viewNames, setViewNames] = React.useState({ }); // local list of which data views we want to see
  const [counter, setCounter] = useState(0);
  const [loading, setLoading] = useState(true);

  const updateView = () =>{
    console.log("updateView ");
    setCounter( counter + 1);
  }

  const updateDataStore = (key, value) => {
    console.log("Updating "+key+" : "); //+JSON.stringify(value));
    setDataStore(map => new Map(map.set(key, value)));    
  }

  const handleChange = (event) => {
    setViewNames({
      ...viewNames,
      [event.target.name]: event.target.checked,
    });    
    console.log("ViewNames change "+JSON.stringify(viewNames));
    updateView();
  };

  useEffect(() => {
    // grab the init data and status and charts
    apiClient.get("/status.json").then((e)=>{
      console.log(JSON.stringify(e.data));
      setStatsResult(e.data.items);
      apiClient.get("/getitems.json", {}).then((f)=>{
        let vItems = {};
        f.data.forEach(d => {
          vItems[d]=false;
        });
        console.log(JSON.stringify(f.data));
        setViewItems(f.data)
        setViewNames(vItems);  
        // get all the data and set it up
          f.data.forEach((itemName)=>{
            console.log("dataget "+JSON.stringify(itemName));
            apiClient.get("/data.json",{params:{"name":itemName}}).then((g)=>{
              console.log("data from "+itemName);//JSON.stringify(g.data));
              g.data.forEach(d => {
                d.timestamp = moment(d.timestamp).valueOf(); // date -> epoch        
                d[d.nameid]=d.value;
              });
              //console.log("Data Store" + JSON.stringify(g.data));
              //console.log(JSON.stringify(res.data));
              updateDataStore(itemName,g.data);  
          })         
        })
        setLoading(false);  
      })
      
    })

    // const interval = setInterval(() => {
    //   getStatus();
    //   if (viewItems==null) getViewItems();
    //   //getData();
    // }, 5000);
    // return () => clearInterval(interval);
  }, []);

  // const fortmatResponse = (res) => {
  //   return JSON.stringify(res, null, 2);
  // };

  async function getStatus() {
    try {
      const res = await apiClient.get("/status.json");
      console.log(JSON.stringify(res.data));
      setStatsResult(res.data.items);
    } catch (err) {
      //setGetResult(fortmatResponse(err.response?.data || err));
    }
  }
/**
 * Get the instrumentation data view items available
 */
  async function getViewItems() {
    try {
      
      // const value = evt.currentTarget.getAttribute("data-value");
      const res = await apiClient.get("/getitems.json", {});
      let vItems = {};
      res.data.forEach(d => {
        vItems[d]=false;
      });
      console.log(JSON.stringify(res.data));
      setViewItems(res.data)
      setViewNames(vItems);
      console.log("vItems"+JSON.stringify(vItems));
      // setMeasureData(res.data);
    } catch (err) {
      //setGetResult(fortmatResponse(err.response?.data || err));
    }
  }

  async function getData(evt) {
    try {
      const value = evt.currentTarget.getAttribute("data-value");
      console.log("Getting data "+value);
      const res = await apiClient.get("/data.json",{params:{"name":value}});
      res.data.forEach(d => {
        d.timestamp = moment(d.timestamp).valueOf(); // date -> epoch        
        d[d.nameid]=d.value;
      });
      console.log("Data Store" + JSON.stringify(dataStore));
      //console.log(JSON.stringify(res.data));
      updateDataStore(value,res.data);
      // setDataStore(dataStore.put(value,res.data))

      // setDataStore({
      //   ...value,
      //   [value]: res.data,
      // });
      console.log("Data Store" + JSON.stringify(dataStore));
    } catch (err) {
      //setGetResult(fortmatResponse(err.response?.data || err));
    }
  }
  
  function startUp() {
    cmdAction('start')
  }
  function shutDown() {
    cmdAction('stop')
  }

  async function cmdAction(action) {
    const postData = {
    };

    try {
       await apiClient.post("/cmd?action=" + action, postData, {
        headers: {
          "x-access-token": "token-value",
        },
      });

      // const result = {
      //   status: res.status + "-" + res.statusText,
      //   headers: res.headers,
      //   data: res.data,
      // };

      // setPostResult(fortmatResponse(result));
    } catch (err) {
      // setPostResult(fortmatResponse(err.response?.data || err));
    }   
  }

  console.log("dataStore:"+JSON.stringify(dataStore));

  return (
    <div id="app" className="container my-3">
      <h3>EPEX control panel</h3>


      <div className="card mt-3">
        <div className="card-header">
        <div className="input-group input-group-sm">
        <FormLabel type="text" disabled  >Server</FormLabel>   
            <button className="btn btn-sm btn-success" onClick={startUp}>Startup</button>
            <button className="btn btn-sm btn-warning ml-2" onClick={shutDown}>Shutdown</button>
          </div></div>
        <div className="card-body">   
        {getStatsResult === null ? 
        <CircularProgress color="secondary" /> : null
        }
          {/* { getResult && <div className="alert alert-secondary mt-2" role="alert"><pre>{getResult}</pre></div> } */}
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableBody>
                {getStatsResult !== null ?
                  Object.entries(getStatsResult).map(([key, value]) => (
                    <TableRow
                      key={key}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {key}
                      </TableCell>
                      <TableCell align="right">{value}</TableCell>
                    </TableRow>
                  ))
                  : null }
              </TableBody>
            </Table>
          </TableContainer>
          <IconButton variant="contained" color="success" size="small" onClick={getStatus}>
            <SyncIcon fontSize="inherit" />
          </IconButton>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-header">Items 
         <IconButton variant="contained" color="success" size="small" onClick={getViewItems}>
          <SyncIcon fontSize="inherit" />
        </IconButton></div>
        <div className="card-body">
        <FormControl component="fieldset" variant="standard">           
              <FormGroup>
                {viewItems !== null ?
                  viewItems.map((itr,idx)=>(   
                    <FormControlLabel key={idx}
                    control={
                      <Switch value={viewNames[itr]} onChange={handleChange} name={itr} />
                    }
                    label={itr}
                  />                  
                  ))
                   : <p>No Data</p>
                }
          </FormGroup>     
        </FormControl>
                
        </div>
      </div>

      {viewItems !== null ?
      
      viewItems.map((key,value) =>(
        (true) ? //  show all data for now
        <div className="card mt-3" key={key}>
        <div className="card-header"> {key}
         <IconButton variant="contained" data-value={key} color="success" size="small" onClick={getData}>
          <SyncIcon fontSize="inherit" />
        </IconButton></div>
        <div className="card-body">                  
          <LineChart
            width={700}
            height={300}
            data={dataStore}
            margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
          >
            <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
            <Line type="monotone" dataKey={key} stroke="#82ca9d" strokeWidth={1} />           
            <XAxis
              dataKey="timestamp"
              scale="time"
              domain={["auto", "auto"]}
              name="Time"
              tickFormatter={unixTime => moment(unixTime).format("YYYY-MM-DD HH:mm:ss")}
              type="number"
            />
            <YAxis />
            <Tooltip labelFormatter={value => {return moment(value).format("YYYY-MM-DD HH:mm:ss")}} />
          </LineChart>
        </div>
      </div>
        : null
      ) 
      ): null
      }


      {/* <div className="card mt-3">
        <div className="card-header"> test load count 
         <IconButton variant="contained" data-value="loadcount" color="success" size="small" onClick={getData}>
          <SyncIcon fontSize="inherit" />
        </IconButton></div>
        <div className="card-body">

          <LineChart
            width={700}
            height={300}
            data={dataStore['loadcount']}
            margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
          >
            <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
            <Line type="monotone" dataKey="loadcount" stroke="#82ca9d" strokeWidth={1} />
            
            <XAxis
              dataKey="timestamp"
              scale="time"
              domain={["auto", "auto"]}
              name="Time"
              tickFormatter={unixTime => moment(unixTime).format("YYYY-MM-DD HH:mm:ss")}
              type="number"
            />
            <YAxis />
            <Tooltip labelFormatter={value => {return moment(value).format("YYYY-MM-DD HH:mm:ss")}} />
          </LineChart>
        </div>
      </div> */}


      {/* <div className="card mt-3">
        <div className="card-header">Another chart</div>
        <div className="card-body">
         
          <LineChart
            width={700}
            height={300}
            data={measureData}
            margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
          >
            <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
            <Line type="monotone" dataKey="loadcount" stroke="#82ca9d" strokeWidth={1} />            
            <XAxis
              dataKey="timestamp"
              scale="time"
              domain={["auto", "auto"]}
              name="Time"
              tickFormatter={unixTime => moment(unixTime).format("YYYY-MM-DD HH:mm:ss")}
              type="number"
            />
            <YAxis />
            <Tooltip labelFormatter={value => {return moment(value).format("YYYY-MM-DD HH:mm:ss")}} />
          </LineChart>

        </div>
    </div>*/} 
    </div> 


     
  );
}

export default App;
