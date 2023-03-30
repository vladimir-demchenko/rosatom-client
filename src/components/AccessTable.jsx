import { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import AccessService from '../services/AccessService';
import IsService from '../services/IsService';
import ResourceService from '../services/ResourceService';
import RoleService from '../services/RoleService';
import UserService from '../services/UserService';
import { accessAPI } from '../services/AccessService';
import AutocompleteTableEditor from './AutocompleteTableEditor';
import Handsontable from 'handsontable';
import { Button, Spinner, useToast } from '@chakra-ui/react';
// register Handsontable's modules
registerAllModules();

function debounce(func, wait = 200) {
  let lastTimer = null;
  let result;

  function _debounce(...args) {
    if (lastTimer) {
      clearTimeout(lastTimer);
    }
    lastTimer = setTimeout(() => {
      result = func.apply(this, args);
    }, wait);
    
    return result;
  }

  return _debounce;
}

Handsontable.cellTypes.registerCellType('autocomplete-table', {
  editor: AutocompleteTableEditor,
  renderer: Handsontable.renderers.AutocompleteRenderer
});

const AccessTable = () => {
  const [access, setAccess] = useState([]);
  const [is, setIs] = useState([]);
  const [resource, setResource] = useState([]);
  const [role, setRole] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const hotTableComponent = useRef(null);
  const toast = useToast();
  let debounceFn = null;

  const selectedKeys = ['id', 'fullname', 'personalId', 'email', 'status']

  const sourceUser = (arrObj) => {
    return arrObj.map(item => Object.fromEntries(Object.entries(item).filter(([key]) => selectedKeys.includes(key))))
  }

  const addEventListener = (input, colIndex) => {
    input.addEventListener('keydown', event => {
      debounceFn(colIndex, event);
    });
  };

  const getInitializedElements = colIndex => {
    const div = document.createElement('div');
    const input = document.createElement('input');

    div.className = 'filterHeader';

    addEventListener(input, colIndex);

    div.appendChild(input);

    return div;
  };

  const addInput = (col, TH) => {
    if (typeof col !== 'number') {
      return col;
    }

    if (col >= 0 && TH.childElementCount < 2) {
      TH.appendChild(getInitializedElements(col));
    }
  };

  useEffect(() => {
    const hot = hotTableComponent.current.hotInstance;
   // eslint-disable-next-line react-hooks/exhaustive-deps
   debounceFn = debounce((colIndex, event) => {
     const filtersPlugin = hot.getPlugin('filters');

     filtersPlugin.removeConditions(colIndex);
     filtersPlugin.addCondition(colIndex, 'contains', [event.target.value]);
     filtersPlugin.filter();
   }, 100);
 }, []);


  const getName = (objctName) => {
    return Array.from(objctName, x => x.name);
  }

  async function getAccesses() {
    setError(false);
    setLoading(true);
    await AccessService.getAll()
    .then(res => {
      setAccess(res.data);
      setLoading(false);
    })
    .catch(e => {
      setError(true);
      console.log(e);
    })
  }

  async function getUsers() {
    setError(false);
    setLoading(true);
    await UserService.getAll()
    .then(res => {
      setUsers(res.data);
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

  useLayoutEffect(() => {
    getAccesses();
    getUsers();
    getIS();
    getResource();
    getRole();
  }, [])

  const getColumns = useMemo(() => {
    return [
      {data: 'id'},
      {
        type: 'date',
        dateFormat: 'MM/DD/YYYY',
        correctFormat: true,
        defaultDate: 'dateRequest',
        datePickerConfig: {
            firstDay: 1,
            showWeekNumber: false,
            numberOfMonths: 1,
        },
        data: 'dateRequest'},
      {data: 'document'},
      {
        type: 'autocomplete-table',
        source: sourceUser(users),
        data: 'User.fullname',
        trimDropdown: false,
        visibleRows: 5,
        handsontable: {
          autoColumnSize: true,
          colHeaders: ['ФИО', 'id', 'Табельный', 'Email', 'Статус'],
          getValue() {
            const selection = this.getSelectedLast();

            // Get the manufacturer name of the clicked row and ignore header
            // coordinates (negative values)
            return this.getSourceDataAtRow(Math.max(selection[0], 0)).fullname;
          }
        }
      },
      {data: 'User.personalId'},
      {
        type: 'autocomplete',
        source: getName(is),
        data: 'nameIS'
      },
      {
        type: 'autocomplete',
        source: getName(resource),
        trimDropdown: false,
        data: 'nameResource'
      },
      {
        type: 'autocomplete',
        source: getName(role),
        data: 'nameRole'
      },
      {data: 'typeOfAccess'},
      {data: 'comment'},
      {data: 'disableAccess'},
      {
        type: 'date',
        dateFormat: 'MM/DD/YYYY',
        correctFormat: true,
        defaultDate: 'dateRequest',
        datePickerConfig: {
            firstDay: 1,
            showWeekNumber: false,
            numberOfMonths: 1,
        },
        data: 'dateDisableAccess'}
    ]
  }, [is, resource, role, users])


  const handleSetUpdate = async (row) => {
    const hot = hotTableComponent.current.hotInstance;
    const id = hot.getDataAtRow(row)[0];
    const value = {
        dateRequest: new Date(hot.getDataAtCell(row, 1)).toISOString(),
        document: hot.getDataAtCell(row, 2),
        name: hot.getCell(row, 3).id,
        personalId: hot.getCell(row, 3).id,
        IS: getName(is).indexOf(hot.getDataAtCell(row, 5)) + 1,
        resource: getName(resource).indexOf(hot.getDataAtCell(row, 6)) + 1,
        role: getName(role).indexOf(hot.getDataAtCell(row, 7)) + 1,
        typeOfAccess: hot.getDataAtCell(row, 8),
        comment: hot.getDataAtCell(row, 9),
        disableAccess: hot.getDataAtCell(row, 10),
        dateDisableAccess: new Date(hot.getDataAtCell(row, 11)).toISOString()
    };
    // console.log(getFIOWithOutId(users), value)
    // await AccessService.update(id, value)
    // .then((res) => {
    //   console.log(hot.getDataAtRow(row).slice(1))
    //   console.log(res.data)
    // })
    // .catch((e) => {
    //   console.log(e)
    // })
  }
  
  function addNewRow() {
    hotTableComponent.current.hotInstance.alter('insert_row_below');
  }

  

  return (
    <>
    <Button onClick={()=> console.log(hotTableComponent.current.hotInstance.getData())}>Export to XLSX</Button>
    <Button colorScheme='blue' variant='solid' onClick={addNewRow}>Add new row</Button>
      <HotTable
        data={access}
        ref={hotTableComponent}
        rowHeaders={false}
        colHeaders={['id', 'Дата заявки', '№ документа', 'ФИО', 'Табельный', 'ИС', 'Ресурс', 'Роль', 'Тип доступа', 'Комментарий', '№ документа о прекращении доступа', 'Дата прекращения']}
        //height="auto"
        width="auto"
        columnHeaderHeight={35}
        colWidths={[40, 100, 100, 300, 100, 300, 275, 300, 100, 300, 200, 150]}
        columns={getColumns}
        columnSorting={true}
        filters={true}
        preventOverflow="horizontal"
        afterChange={(changes, source) => {
          if (source === 'edit' && changes[0][1] !== 'id') {
            changes.forEach(([row, prop, oldValue, newValue]) => {
            })
          }
        }}
        afterCreateRow={(index, amount, source) => {
          // AccessService.create({
          //   id: Math.max.apply(null, hotTableComponent.current.hotInstance.getDataAtCol(0).filter((x) => {return isFinite(x)})) + 1,
          //   is: 0,
          //   resource: 0,
          //   role: 0,
          //   personalId: 1,
          //   name: 1
          // })
          hotTableComponent.current.hotInstance.setDataAtCell(index, 0, Math.max.apply(null, hotTableComponent.current.hotInstance.getDataAtCol(0).filter((x) => {return isFinite(x)})) + 1)
        }}
        afterGetColHeader={addInput}
        beforeOnCellMouseDown={function(event, coords){
          if (coords.row === -1 && event.target.nodeName === 'INPUT'){
            event.stopImmediatePropagation();
            this.deselectCell();
          }
        }}
        afterSelection={(row, column, row2, column2, preventScrolling, selectionLayerLevel) => {
          if (column === 6 && getName(is).indexOf(hotTableComponent.current.hotInstance.getDataAtCell(row, column-1)) !== null) {
            hotTableComponent.current.hotInstance.setCellMeta(row, column, 'source', getName(resource.filter(item => item.nameIS === is[getName(is).indexOf(hotTableComponent.current.hotInstance.getDataAtCell(row, column-1))].name)))
          }
          if (column === 7 && getName(resource).indexOf(hotTableComponent.current.hotInstance.getDataAtCell(row, column-1)) !== null) {
            hotTableComponent.current.hotInstance.setCellMeta(row, column, 'source', getName(role.filter(item => item.nameResource === resource[getName(resource).indexOf(hotTableComponent.current.hotInstance.getDataAtCell(row, column-1))].name)))
          }
        }}
        licenseKey="non-commercial-and-evaluation" // for non-commercial use only
      />
    </>
  );
};

export default AccessTable;