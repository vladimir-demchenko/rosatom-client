import { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { Button } from '@chakra-ui/react';
import IsService from '../services/IsService';
import ResourceService from '../services/ResourceService';
import RoleService from '../services/RoleService';
// register Handsontable's modules
registerAllModules();


const Test = () => {
  const [data, setData] = useState([]);
  const [is, setIs] = useState([]);
  const [resource, setResource] = useState([]);
  const [role, setRole] = useState([]);
  const [loading, setLoading] = useState([]);
  const [error, setError] = useState([]);

  const temp = [];

  const data1 = [
    {
      category: 'asdfasf',
      name: null,
      title: null,
      __children: [
        { name: 'asfasdf', title: null },
        { name: 'asfasdf', title: null },
        { name: 'asfasdf', title: null, __children: [{ title: 'asdfasfd' }, { title: 'asdfasfdsadf' }] }
      ]
    },
    {
      category: 'hello'
    }
  ]

  async function getIS() {
    setError(false);
    setLoading(true);
    await IsService.getAll()
    .then(res => {
      setIs(res.data);
      setLoading(false);
    })
    .catch(e => {
      setError(true);
      console.log(e);
    })
  }

  async function getResource() {
    setError(false);
    setLoading(true);
    await ResourceService.getAll()
    .then(res => {
      setResource(res.data);
      setLoading(false);
    })
    .catch(e => {
      setError(true);
      console.log(e);
    })
  }

  async function getRole() {
    setError(false);
    setLoading(true);
    await RoleService.getAll()
    .then(res => {
      setRole(res.data);
      setLoading(false);
    })
    .catch(e => {
      setError(true);
      console.log(e);
    })
  }

  function getData() {
    const data = [];

    is.forEach((item) => {
      data.push({is: item.name, resource: null, role: null,})
    })

    // resource.forEach((item) => {
    //   data.find(x => x.is === item.nameIS).__children.push({resource: item.name, role: null})
    // })
    
    return data;
  }

  useLayoutEffect(() => {
    getIS();
    getResource();
    getRole();
  }, [])


  const hotRef = useRef(null);

  function addNewRow() {
    hotRef.current.hotInstance.alter('insert_row_below');
  }
  

  return (
    <>
    <Button colorScheme='blue' variant='solid' onClick={addNewRow}>Add new row</Button>
     <HotTable
        data={data1}
        ref={hotRef}
        rowHeaders={true}
        height="auto"
        width="auto"
        nestedRows={true}
        contextMenu={true}
        bindRowsWithHeaders={true}
        beforeChange={(changes, source) => {
          
        }}
        afterChange={(changes, source) => {
          
        }}
        licenseKey="non-commercial-and-evaluation" // for non-commercial use only
      />
    </>
  );
};

export default Test;