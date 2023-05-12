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
import { Divider } from 'antd';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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
  const hotEmpty = useRef(null);
  const [empty] = useState([{
    id: null,
    dateRequest: null,
    document: null,
    surname: '',
    firstname: '',
    lastname: '',
    personalId: null,
    IS: null,
    resource: null,
    role: null,
    typeOfAccess: null,
    comment: null,
    disableAccess: null,
    dateDisableAccess: null
  }]);
  const [collapsed, setCollapsed] = useState(true);
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
        dateFormat: 'DD/MM/YYYY',
        correctFormat: true,
        defaultDate: 'dateRequest',
        datePickerConfig: {
            firstDay: 1,
            showWeekNumber: false,
            numberOfMonths: 1,
        },
        data: 'dateRequest'
      },
      {data: 'document'},
      {
        type: 'autocomplete-table',
        source: sourceUser(users),
        data: 'fullname',
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
      {data: 'personalId'},
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
        data: 'dateDisableAccess'
      },
      {data: 'disableAccess'},
    ]
  }, [is, resource, role, users])

  const getEmptyColumns = useMemo(() => {
    return [
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
        data: 'fullname',
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
      {data: 'personalId'},
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
        dateRequest: hot.getDataAtCell(row, 1) ? hot.getDataAtCell(row, 1) : '',
        document: hot.getDataAtCell(row, 2) ? hot.getDataAtCell(row, 2) : '',
        surname: hot.getDataAtCell(row, 3) ? hot.getDataAtCell(row, 3).split(' ')[0] : '',
        firstname: hot.getDataAtCell(row, 3) ? hot.getDataAtCell(row, 3).split(' ')[1] : '',
        lastname: hot.getDataAtCell(row, 3) ? hot.getDataAtCell(row, 3).split(' ')[2] : '',
        personalId: hot.getDataAtCell(row, 4),
        nameIS: hot.getDataAtCell(row, 5) ? hot.getDataAtCell(row, 5) : '',
        nameResource: hot.getDataAtCell(row, 6) ? hot.getDataAtCell(row, 6) : '',
        nameRole: hot.getDataAtCell(row, 7) ? hot.getDataAtCell(row, 7) : '',
        typeOfAccess: hot.getDataAtCell(row, 8) ? hot.getDataAtCell(row, 8) : '',
        comment: hot.getDataAtCell(row, 9) ? hot.getDataAtCell(row, 9) : '',
        disableAccess: hot.getDataAtCell(row, 10) ? hot.getDataAtCell(row, 10) : '',
        dateDisableAccess: hot.getDataAtCell(row, 11) ? hot.getDataAtCell(row, 11) : ''
    };
    await AccessService.update(id, value)
    .then((res) => {
      console.log(res.data)
    })
    .catch((e) => {
      console.log(e)
    })
    getAccesses();
    getUsers();
    getIS();
    getResource();
    getRole();
  }
  
  function addNewRow() {
    const hot = hotEmpty.current.hotInstance;
    console.log(hot.getSourceData());
    AccessService.create(hot.getSourceData()[0])
    .then(res => {
      console.log(res);
      hot.clear();
      getAccesses();
      getUsers();
      getIS();
      getResource();
      getRole();
    })
    .catch(e => {
      console.log(e);
    })
  }

  const handleInsertPersonalId = async (id, row) => {
    const hot = hotTableComponent.current.hotInstance;
    await UserService.getOne(id)
    .then(res => {
      hot.setDataAtCell(row, 4, res.data.personalId);
    })
  }

  const exportToXlsx = () => {
    // Get the table data from Handsontable
    const data = hotTableComponent.current.hotInstance.getData();
    
    // Convert the data to a worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Convert the worksheet to a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Generate the xlsx file and download it
    const file = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([file]), 'table_data.xlsx');
  };

  return (
    <>
    <Button onClick={exportToXlsx}>Export to XLSX</Button>
    <Button colorScheme='blue' variant='solid' onClick={() => setCollapsed(prev => !prev)}>Add new row</Button>
    {!collapsed && <div>
      <HotTable
        data={empty}
        ref={hotEmpty}
        rowHeaders={false}
        colHeaders={['Дата заявки', '№ документа', 'ФИО', 'Табельный', 'ИС', 'Ресурс', 'Роль', 'Тип доступа', 'Комментарий', 'Дата прекращения', 'Приказ']}
        //height="auto"
        width="auto"
        columnHeaderHeight={35}
        colWidths={[100, 100, 300, 100, 300, 275, 300, 100, 300, 200, 150]}
        columns={getEmptyColumns}
        columnSorting={true}
        filters={true}
        preventOverflow="horizontal"
        licenseKey="non-commercial-and-evaluation"
      />
      <Button onClick={addNewRow}>Add</Button>
    </div>}
    <Divider/>
      <HotTable
        data={access}
        ref={hotTableComponent}
        rowHeaders={false}
        colHeaders={['id', 'Дата заявки', '№ документа', 'ФИО', 'Табельный', 'ИС', 'Ресурс', 'Роль', 'Тип доступа', 'Комментарий', 'Дата прекращения', 'Приказ']}
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
            console.log(changes);
            changes.forEach(([row, prop, oldValue, newValue]) => {
              if (oldValue !== newValue) {
                handleSetUpdate(row);
              }
            })
          }

          if (source === 'edit' && changes[0][1] === 'fullname') {
            changes.forEach(([row, prop, oldValue, newValue]) => {
              if (oldValue !== newValue) {
                const id = hotTableComponent.current.hotInstance.getCell(row, 3).id;
                handleInsertPersonalId(id, row);
              }
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
          // if (column === 6 && hotTableComponent.current.hotInstance.getDataAtCell(row, column-1) !== null) {
          //   hotTableComponent.current.hotInstance.setCellMeta(row, column, 'source', getName(resource.filter(item => item.nameIS === is[getName(is).indexOf(hotTableComponent.current.hotInstance.getDataAtCell(row, column-1))].name)))
          // }
          // if (column === 7 && hotTableComponent.current.hotInstance.getDataAtCell(row, column-1) !== null) {
          //   hotTableComponent.current.hotInstance.setCellMeta(row, column, 'source', getName(role.filter(item => item.nameResource === resource[getName(resource).indexOf(hotTableComponent.current.hotInstance.getDataAtCell(row, column-1))].name)))
          // }
        }}
        licenseKey="non-commercial-and-evaluation" // for non-commercial use only
      />
    </>
  );
};

export default AccessTable;