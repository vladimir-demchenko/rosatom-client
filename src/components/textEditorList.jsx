import React from 'react';

function autoFocusAndSelect(input) {
    input?.focus();
    input?.select();
}

function textEditorList({row, column, onRowChange, onClose}) {
    return (
        <input
            className='rdg-text-editor @layer rdg.TextEditor'
            ref={autoFocusAndSelect}
            value={row[column.key]}
            onChange={((event) => onRowChange({...row, [column.key]: event.target.value}))}
            onBlur={() => onClose(true)}
            list={column.key}
        />
    );
}

export default textEditorList;