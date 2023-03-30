
import { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import UserService from '../services/UserService';
import { Button } from '@chakra-ui/react';

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

const UserDataGrid = () => {
  const [users, setUsers] = useState([]);
  const [position, setPosition] = useState([]);
  const [subdivision, setSubdivision] = useState([]);
  const [department, setDepartment] = useState([]);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

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
        data: 'Position.name'
      },
      { type: 'autocomplete',
        source: getName(subdivision),
        data: 'Subdivision.name'
      },
      { type: 'autocomplete',
        source: getName(department),
        data: 'Department.name'
      },
      { data: 'status' },
      { data: 'comment' },
      {},
      {}
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
      position: getName(position).indexOf(hot.getDataAtRow(row)[7]) + 1,
      subdivision: getName(subdivision).indexOf(hot.getDataAtRow(row)[8]) + 1,
      department: getName(department).indexOf(hot.getDataAtRow(row)[9]) + 1,
      status: hot.getDataAtRow(row)[10],
      comment: hot.getDataAtRow(row)[11],
    };

    console.log(id, value, getName(position).indexOf(hot.getDataAtRow(row)[7]) + 1);
  }
  
  function addNewRow() {
    hotTableComponent.current.hotInstance.alter('insert_row_below');
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
    {console.log()}
    <Button onClick={exportToXlsx}>Export to XLSX</Button>
    <button onClick={addNewRow}>Add new row</button>
      <HotTable
        data={users}
        ref={hotTableComponent}
        rowHeaders={false}
        colHeaders={['id', 'Табельный', 'Фамилия', 'Имя', 'Отчество', 'Телефон', 'E-mail', 'Должность', 'Подразделение', 'Организация', 'Статус', 'Комментарий', 'Дата', 'Приказ']}
        height="auto"
        width="auto"
        columnHeaderHeight={35}
        colWidths={[40, 100, 100, 100, 100, 100, 275, 300, 300, 300, 50, 300]}
        columns={getColumns}
        columnSorting={true}
        filters={true}
        afterChange={(changes, source) => {
          if (source === 'edit') {
            changes.forEach(([row, prop, oldValue, newValue]) => {
              handleSetUpdate(row);
            })
          }
        }}
        afterCreateRow={(index, amount, source) => {
          hotTableComponent.current.hotInstance.setDataAtCell(index, 0, Math.max.apply(null, hotTableComponent.current.hotInstance.getDataAtCol(0).filter((x) => {return isFinite(x)})) + 1)
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
        licenseKey="non-commercial-and-evaluation" // for non-commercial use only
      />
    </>
  );
};

export default UserDataGrid;