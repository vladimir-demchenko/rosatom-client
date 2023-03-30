
import { useEffect, useState, useMemo, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import IsService from '../services/IsService';
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

const IsTable = () => {
  const [data, setData] = useState([]);
  const hotTableComponent = useRef(null);
  let debounceFn = null;

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



  const getColumns = useMemo(() => {
    return [
      {data: 'id'},
      {data: 'name'}
    ]
  }, [])


  const handleSetUpdate = async (row) => {
    const hot = hotTableComponent.current.hotInstance;
    const id = hot.getDataAtRow(row)[0];
    const value = {
        name: hot.getDataAtCell(row, 1)
    };

    console.log(id, value);
    console.log(data);
  }
  
  function addNewRow() {
    hotTableComponent.current.hotInstance.alter('insert_row_below');
  }

  return (
    <>
    {console.log()}
    <button onClick={addNewRow}>Add new row</button>
      <HotTable
        data={data}
        ref={hotTableComponent}
        rowHeaders={false}
        colHeaders={['id', 'Название ИС']}
        height="auto"
        width="auto"
        columnHeaderHeight={35}
        colWidths={[40, 300]}
        columns={getColumns}
        columnSorting={true}
        filters={true}
        afterChange={(changes, source) => {
          if (source === 'edit' && changes[0][1] !== 'id') {
            changes.forEach(([row, prop, oldValue, newValue]) => {
              handleSetUpdate(row);
            })
          }
        }}
        afterCreateRow={(index, amount, source) => {
          //IsService.create({id: Math.max.apply(null, hotTableComponent.current.hotInstance.getDataAtCol(0).filter((x) => {return isFinite(x)})) + 1})
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

export default IsTable;