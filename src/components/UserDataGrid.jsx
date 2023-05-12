
import { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import UserService from '../services/UserService';
import { Button } from '@chakra-ui/react';
import { Divider } from 'antd';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import PositionService from '../services/PositionService';
import SubdivisionService from '../services/SubdivisionService';
import DepartmentService from '../services/DepartmentService';
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

const UserDataGrid = () => {
  const [users, setUsers] = useState([]);
  const [position, setPosition] = useState([]);
  const [subdivision, setSubdivision] = useState([]);
  const [department, setDepartment] = useState([]);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(true);
  const [empty] = useState([{
    personalId: null,
    surname: null,
    name: null,
    lastname: null,
    phone: null,
    email: null,
    position: null,
    subdivision: null,
    department: null,
    status: null,
    comment: null,
  }])

  const hotEmpty = useRef(null);

  const hotTableComponent = useRef(null);
  let debounceFn = null;

  const addEventListener = (input, colIndex) => {
    input.addEventListener('keydown', event => {
      debounceFn(colIndex, event);
    });
  };

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
  async function getPositions() {
    setError(false);
    setLoading(true);
    await PositionService.getAll()
    .then(res => {
      setPosition(res.data);
      setLoading(false);
    })
    .catch(e => {
      setError(true);
      console.log(e);
    })
  }
  async function getSubdivisions() {
    setError(false);
    setLoading(true);
    await SubdivisionService.getAll()
    .then(res => {
      setSubdivision(res.data);
      setLoading(false);
    })
    .catch(e => {
      setError(true);
      console.log(e);
    })
  }
  async function getDepartments() {
    setError(false);
    setLoading(true);
    await DepartmentService.getAll()
    .then(res => {
      setDepartment(res.data);
      setLoading(false);
    })
    .catch(e => {
      setError(true);
      console.log(e);
    })
  }

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

  useLayoutEffect(() => {
    getUsers();
    getPositions();
    getDepartments();
    getSubdivisions();
  }, [])

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


  const getColumns = useMemo(() => {
    return [
      { data: 'id' },
      { data: 'personalId' },
      { data: 'surname' },
      { data: 'name' },
      { data: 'lastname' },
      { data: 'phone' },
      { data: 'email' },
      { type: 'autocomplete',
        source: getName(position),
        data: 'position'
      },
      { type: 'autocomplete',
        source: getName(subdivision),
        data: 'subdivision'
      },
      { type: 'autocomplete',
        source: getName(department),
        data: 'department'
      },
      { data: 'status' },
      { data: 'comment' },
      {type: 'date',
      dateFormat: 'MM/DD/YYYY',
      correctFormat: true,
      defaultDate: 'dateRequest',
      datePickerConfig: {
          firstDay: 1,
          showWeekNumber: false,
          numberOfMonths: 1,
      },
      data: 'dateDisable'},
      {data:'document'}
    ]
  }, [position, subdivision, department])

  const getEmptyColumns = useMemo(() => {
    return [
      { data: 'personalId' },
      { data: 'surname' },
      { data: 'name' },
      { data: 'lastname' },
      { data: 'phone' },
      { data: 'email' },
      { type: 'autocomplete',
        source: getName(position),
        data: 'position'
      },
      { type: 'autocomplete',
        source: getName(subdivision),
        data: 'subdivision'
      },
      { type: 'autocomplete',
        source: getName(department),
        data: 'department'
      },
      { data: 'status' },
      { data: 'comment' },
      {type: 'date',
      dateFormat: 'MM/DD/YYYY',
      correctFormat: true,
      defaultDate: 'dateRequest',
      datePickerConfig: {
          firstDay: 1,
          showWeekNumber: false,
          numberOfMonths: 1,
      },
      data: 'dateDisable'},
      {data:'document'}
    ]
  }, [position, subdivision, department])


  const handleSetUpdate = async (row) => {
    const hot = hotTableComponent.current.hotInstance;
    const id = hot.getDataAtRow(row)[0];
    const value = {
      personalId: hot.getDataAtRow(row)[1],
      surname: hot.getDataAtRow(row)[2],
      name: hot.getDataAtRow(row)[3],
      lastname: hot.getDataAtRow(row)[4],
      phone: hot.getDataAtRow(row)[5],
      email: hot.getDataAtRow(row)[6],
      position: hot.getDataAtRow(row)[7],
      subdivision: hot.getDataAtRow(row)[8],
      department: hot.getDataAtRow(row)[9],
      status: hot.getDataAtRow(row)[10],
      comment: hot.getDataAtRow(row)[11],
    };

    await UserService.update(id, value);
    getUsers();
  }
  
  function addNewRow() {
    const hot = hotEmpty.current.hotInstance;
    UserService.create(hot.getSourceData()[0])
    .then(res => {
      console.log(res);
      hot.clear();
      getUsers();
    })
    .catch(e => {
      console.log(e);
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
        colHeaders={['Табельный', 'Фамилия', 'Имя', 'Отчество', 'Телефон', 'E-mail', 'Должность', 'Подразделение', 'Организация', 'Статус', 'Комментарий', 'Дата', 'Приказ']}
        //height="auto"
        width="auto"
        columnHeaderHeight={35}
        colWidths={[40, 100, 100, 100, 100, 100, 275, 300, 300, 300, 50, 300, 150, 150]}
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
        data={users}
        ref={hotTableComponent}
        rowHeaders={false}
        colHeaders={['id', 'Табельный', 'Фамилия', 'Имя', 'Отчество', 'Телефон', 'E-mail', 'Должность', 'Подразделение', 'Организация', 'Статус', 'Комментарий', 'Дата', 'Приказ']}
        
        width="auto"
        columnHeaderHeight={35}
        colWidths={[40, 100, 100, 100, 100, 100, 275, 300, 300, 300, 50, 300, 150, 150]}
        columns={getColumns}
        columnSorting={true}
        filters={true}
        afterChange={(changes, source) => {
          if (source === 'edit' && changes[0][1] !== 'id') {
            changes.forEach(([row, prop, oldValue, newValue]) => {
              if (oldValue !== newValue) {
                handleSetUpdate(row);
              }
            })
          }

        }}
        afterGetColHeader={addInput}
        beforeOnCellMouseDown={function(event, coords){
          if (coords.row === -1 && event.target.nodeName === 'INPUT'){
            event.stopImmediatePropagation();
            this.deselectCell();
          }
        }}
        // afterSelection={(row, column, row2, column2, preventScrolling, selectionLayerLevel) => {
        //   if (column === 7) {
        //     console.log(hot.getDataAtCell(row, column+1));
        //   }
        // }} использовать для таблицы доступа, чтобы настроить дерево выбора
        
        preventOverflow="horizontal"
        licenseKey="non-commercial-and-evaluation" // for non-commercial use only
      />
    </>
  );
};

export default UserDataGrid;