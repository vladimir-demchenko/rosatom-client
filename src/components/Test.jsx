import { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { Button } from '@chakra-ui/react';
import IsService from '../services/IsService';
import ResourceService from '../services/ResourceService';
import RoleService from '../services/RoleService';
import SystemService from '../services/SystemService';
import DataGrid from 'react-data-grid';
import {groupBy as rowGrouper} from 'lodash';
import AccessService from '../services/AccessService';
// register Handsontable's modules
registerAllModules();


const columns = [
  {
    key: 'nameIS',
    name: 'IS',
  },
  {
    key: 'nameResource',
    name: 'resource'
  },
  {
    key: 'nameRole',
    name: 'role'
  }
]

function rowKeyGetter(row) {
  return row.id;
}

const options = ['nameIS', 'nameResource'];

const Test = () => {
  const [system, setSystem] = useState([]);
  const [is, setIs] = useState([]);
  const [resource, setResource] = useState([]);
  const [role, setRole] = useState([]);
  const [loading, setLoading] = useState([]);
  const [error, setError] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([
    options[0]
]);
const [expandedGroupIds, setExpandedGroupIds] = useState(() => new Set([]));
async function getAccesses() {
  setError(false);
  setLoading(true);
  await AccessService.getAll()
  .then(res => {
    setSystem(res.data);
    setLoading(false);
  })
  .catch(e => {
    setError(true);
    console.log(e);
  })
}

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

  function toggleOption(option, enable) {
    const index = selectedOptions.indexOf(option);
    if (enable) {
        if (index === -1) {
            setSelectedOptions((options) => [...options, option]);
        }
    } else if (index !== -1) {
        setSelectedOptions((options) => {
            const newOptions = [...options];
            newOptions.splice(index, 1);
            return newOptions;
          })
    }
    setExpandedGroupIds(new Set());
}

  useLayoutEffect(() => {
    getAccesses();
    getIS();
    getResource();
    getRole();
  }, [])


  const hotRef = useRef(null);


  return (
    <div className='groupingClassname'>
      <b>Group by columns:</b>
      <div className='optionsClassname'>
        {options.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={(event) => toggleOption(option, event.target.checked)}
            />{' '}
            {option}
          </label>
        ))}
      </div>

      <DataGrid
        columns={columns}
        rows={system}
        rowKeyGetter={rowKeyGetter}
        groupBy={selectedOptions}
        onRowsChange={setSystem}
        onCellClick={(args, event) => {
            console.log(args, event);
        }}
        rowGrouper={rowGrouper}
        expandedGroupIds={expandedGroupIds}
        onExpandedGroupIdsChange={setExpandedGroupIds}
        defaultColumnOptions={{ resizable: true }}
      />
    </div>
  );
};

export default Test;