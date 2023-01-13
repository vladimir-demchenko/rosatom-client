import { useState, useMemo, useEffect } from 'react';
import ReactDataGrid, { SelectColumn, textEditor, SelectCellFormatter } from 'react-data-grid';

import AccessService from '../services/AccessService';

const dateFormatter = new Intl.DateTimeFormat(navigator.language);

function TimestampFormatter({timestamp}) {
    return <>{dateFormatter.format(timestamp)}</>
} 

function getColumns() {
    return [
        {
            key: 'id',
            name: 'ID',
            width: 40,
            editor: textEditor,
            summaryFormatter() {
                return <strong>Всего</strong>
            }
        },
        {
            key: 'dateRequest',
            name: 'Дата заявки',
            editor: textEditor
        },
        {
            key: 'document',
            name: '№ документа',
            editor: textEditor
        },
        {
            key: 'name',
            name: 'Пользователи',
            width: 120,
            editor: textEditor,
            summaryFormatter({ row }) {
                return <>{row.totalCount}</>
            }
        },
        {
            key: 'personalId',
            name: 'Табельный',
            editor: textEditor
        },
        {
            key: 'organization',
            name: "Организация",
            editor: textEditor //drop down
        },
        {
            key: 'resource',
            name: 'Ресурс',
            editor: textEditor //drop down
        },
        {
            key: 'role',
            name: 'Роль',
            editor: textEditor //drop down
        },
        {
            key: 'comment',
            name: 'Комментарий',
            editor: textEditor
        },
        {
            key: 'disableAccess',
            name: '№ документа об отмене доступа',
            editor: textEditor
        },
        {
            key: 'dateDisableAccess',
            name: 'Дата отмены доступа',
            editor: textEditor
        }
    ];
}

function rowKeyGetter(row) {
    return row.id;
}

function getComparator(sortColumn) {
    switch (sortColumn) {
        case 'document':
        case 'id':
        case 'personalId':
        case 'disableAccess':
        case 'dateDisableAccess':
        case 'dateRequest':
        return (a, b) => {
            return a[sortColumn] - b[sortColumn];
        };
        case 'name':
        case 'organization':
        case 'resource':
        case 'role':
        case 'comment':
        return (a, b) => {
            return a[sortColumn].localeCompare(b[sortColumn]);
        }
        default:
        throw new Error(`unsupported sortColumn: "${sortColumn}"`)
    }
}

export default function AccessTable() {
    const [rows, setRows] = useState([]);
    const [sortColumns, setSortColumns] = useState([]);

    const columns = useMemo(() => getColumns(), []);

    const summaryRows = useMemo(() => {
        const summaryRow = {
            id: 'total_0',
            totalCount: rows.length
        };
        return [summaryRow]
    }, [rows]);

    const sortedRows = useMemo(() => {
        if (sortColumns.length === 0) return rows;

        return [...rows].sort((a, b) => {
            for (const sort of sortColumns) {
                const comparator = getComparator(sort.columnKey);
                const compResult = comparator(a, b);
                if (compResult !== 0) {
                    return sort.direction === 'ASC' ? compResult : -compResult;
                }
            }
            return 0;
        });
    }, [rows, sortColumns]);

    const createNewRow = () => {
        const emptyAccess = {
            id: null,
            dateRequest: null,
            document: null,
            name: '',
            personalId: null,
            organization: '',
            resource: '',
            role: '',
            comment: '',
            disableAccess: null,
            dateDisableAccess: null
        };
        setRows([...rows, emptyAccess]);
    }

    const gridELement = (
        <ReactDataGrid
            rowKeyGetter={rowKeyGetter}
            columns={columns}
            rows={sortedRows}
            defaultColumnOptions={{
                sortable: true,
                resizable: true
            }}
            onRowsChange={setRows}
            sortColumns={sortColumns}
            onSortColumnsChange={setSortColumns}
            topSummaryRows={summaryRows}
            className='fill-grid'
        />
    );

    return (
        <>
            <button onClick={createNewRow}>Add new row</button>
            {gridELement}
        </>
    )
}