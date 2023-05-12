import Handsontable from "handsontable";

const privatePool = new WeakMap();

class AutocompleteTableEditor extends Handsontable.editors.TextEditor {
    constructor(instance) {
        super(instance);

        this.query = null;
        this.strippedChoices = [];
        this.rawChoices = [];
        privatePool.set(this, {
            skipOne: false,
            isMacOS: this.hot.rootWindow.navigator.platform.indexOf('Mac') > -1,
        })
    }

    createElements() {
      super.createElements();
  
      const DIV = this.hot.rootDocument.createElement('DIV');
  
      DIV.className = 'handsontableEditor';
      this.TEXTAREA_PARENT.appendChild(DIV);
  
      this.htContainer = DIV;
      
      this.assignHooks();

      Handsontable.dom.addClass(this.htContainer, 'autocompleteEditor');
      Handsontable.dom.addClass(this.htContainer, this.hot.rootWindow.navigator.platform.indexOf('Mac') === -1 ? '' : 'htMacScroll');
    }
  
    prepare(row, col, prop, td, originalValue, cellProperties) {
      super.prepare(row, col, prop, td, originalValue, cellProperties);
  
      const parent = this;
      const options = {
        startRows: 0,
        startCols: 0,
        minRows: 0,
        minCols: 0,
        className: 'listbox',
        copyPaste: false,
        autoColumnSize: true,
        autoRowSize: true,
        readOnly: true,
        fillHandle: false,
        autoWrapCol: false,
        autoWrapRow: false,
        afterOnCellMouseDown(_, coords) {
          const sourceValue = this.getSourceData(coords.row, coords.col);
  
          if (sourceValue !== void 0) {
            parent.setValue(sourceValue);
          }
          parent.instance.destroyEditor();
        },
        preventWheel: true,
        lauoutDirection: this.hot.isRtl() ? 'rtl' : 'ltr',
      };
  
      if (this.cellProperties.handsontable) {
        Handsontable.helper.extend(options, cellProperties.handsontable);
      }
      
  
      this.htOptions = options;
    }
  
    open() {
      super.open();
  
      if (this.htEditor) {
        this.htEditor.destroy();
      }
  
      if (this.htContainer.style.display === 'none') {
        this.htContainer.style.display = '';
      }
  
      this.htEditor = new this.hot.constructor(this.htContainer, this.htOptions);
      this.htEditor.init();
      this.htEditor.rootElement.style.display = '';
  
      if (this.cellProperties.strict) {
        this.htEditor.selectCell(0,0);
      } else {
        this.htEditor.deselectCell();
      }
  
      Handsontable.dom.setCaretPosition(this.TEXTAREA, 0, this.TEXTAREA.value.length)
      this.refreshDimensions();

      const priv = privatePool.get(this);

      const choicesListHot = this.htEditor.getInstance();
      const trimDropdown = this.cellProperties.trimDropdown === void 0 ? true : this.cellProperties.trimDropdown;

      this.showEditableElement();
      this.focus();
      let scrollbarWidth = Handsontable.dom.getScrollbarWidth();

      if (scrollbarWidth === 0 && priv.isMacOS) {
        scrollbarWidth += 15;
      }

      this.addHook('beforeKeyDown', event => this.onBeforeKeyDown(event))
      choicesListHot.updateSettings({
        colWidths: trimDropdown ? [Handsontable.dom.outerWidth(this.TEXTAREA) - 2] : void 0,
        width: trimDropdown ? Handsontable.dom.outerWidth(this.TEXTAREA) + scrollbarWidth : void 0,
        renderer: (instance, TD, row, col, prop, value, cellProperties) => {
            Handsontable.renderers.TextRenderer(instance, TD, row, col, prop, value, cellProperties);

            const { filteringCaseSensitive, allowHtml, locale } = this.cellProperties;
            const query = this.query;
            let cellValue = Handsontable.helper.stringify(value);
            let indexOfMatch;
            let match;

            if (cellValue && !allowHtml) {
                indexOfMatch = filteringCaseSensitive === true ? 
                    cellValue.indexOf(query) : cellValue.toLocaleLowerCase(locale).indexOf(query.toLocaleLowerCase(locale));
                
                if (indexOfMatch !== -1) {
                    match = cellValue.substr(indexOfMatch, query.length);
                    cellValue = cellValue.replace(match, `<strong>${match}</strong>`);
                }
            }

            TD.innerHTML = cellValue;
        },
        autoColumnSize: true,
      });


      if (priv.skipOne) {
        priv.skipOne = false;
      }

      this.hot._registerTimeout(() => {
        this.queryChoices(this.TEXTAREA.value);
      })
    }
  
    close() {
      if (this.htEditor) {
        this.htEditor.rootElement.style.display = 'none';
      }
  
      super.close();
    }
  
    beginEditing(newInitialValue, event) {
      const onBeginEditing = this.hot.getSettings().onBeginEditing;
  
      if (onBeginEditing && onBeginEditing() === false)  {
        return;
      }
  
      super.beginEditing(newInitialValue, event);
    }
  
    finishEditing(restoreOriginalValue, ctrlDown, callback) {
      if (this.htEditor && this.htEditor.isListening()) {
        this.hot.listen();
      }
  
      if (this.htEditor && this.htEditor.getSelectedLast()) {
        const value = this.htEditor.getInstance().getValue();
  
        if (value !== void 0) { // if the value is undefined then it means we don't want to set the value
          this.setValue(value);
        }
      }
  
      super.finishEditing(restoreOriginalValue, ctrlDown, callback);
    }
  
    assignHooks() {
      this.hot.addHook('afterDestroy', () => {
        if (this.htEditor) {
          this.htEditor.destroy();
        }
      });
    }

    getValue() {
        const selectedValue = this.rawChoices.find((value) => {
            
            return value.fullname === this.TEXTAREA.value;
        });


        if (Handsontable.helper.isDefined(selectedValue)) {
            this.TD.id = selectedValue.id;
            return selectedValue.fullname;
        }

        return this.TEXTAREA.value;
    }

    queryChoices(query) {
        const source = this.cellProperties.source;

        this.query = query;

        if (typeof source === 'function') {
            source.call(this.cellProperties, query, (choices) => {
                this.rawChoices = choices;
                this.updateChoicesList(this.stripValuesIfNeeded(choices));
            });
        } else if (Array.isArray(source)) {
            this.rawChoices = source;
            this.updateChoicesList(source);
        } else {
            this.updateChoicesList([]);
        }
    }

    updateChoicesList(choicesList) {
        const pos = Handsontable.dom.getCaretPosition(this.TEXTAREA);
        const endPos = Handsontable.dom.getSelectionEndPosition(this.TEXTAREA);
        const sortByRelevanceSetting = this.cellProperties.sortByRelevance;
        const filterSetting = this.cellProperties.filter;
        let orderByRelevance = null;
        let highlightIndex = null;
        let choices = choicesList;

        if (sortByRelevanceSetting) {
        orderByRelevance = this.sortByRelevance(
            this.stripValueIfNeeded(this.getValue()),
            choices,
            this.cellProperties.filteringCaseSensitive
        );
        }
        const orderByRelevanceLength = Array.isArray(orderByRelevance) ? orderByRelevance.length : 0;

        if (filterSetting === false) {
        if (orderByRelevanceLength) {
            highlightIndex = orderByRelevance[0];
        }

        } else {
        const sorted = [];

        for (let i = 0, choicesCount = choices.length; i < choicesCount; i++) {
            if (sortByRelevanceSetting && orderByRelevanceLength <= i) {
            break;
            }
            if (orderByRelevanceLength) {
            sorted.push(choices[orderByRelevance[i]]);
            } else {
            sorted.push(choices[i]);
            }
        }

        highlightIndex = 0;
        choices = sorted;
        }

        this.strippedChoices = choices;
        this.htEditor.loadData(choices);
        
        

        this.updateDropdownHeight();
        this.flipDropdownIfNeeded();

        if (this.cellProperties.strict === true) {
            this.highlightBestMatchingChoice(highlightIndex);
        }

        this.hot.listen();

        Handsontable.dom.setCaretPosition(this.TEXTAREA, pos, (pos === endPos ? void 0 : endPos));
    }

    flipDropdownIfNeeded() {
        const trimmingContainer = Handsontable.dom.getTrimmingContainer(this.hot.view._wt.wtTable.TABLE);
        const isWindowAScrollableElement = trimmingContainer === this.hot.rootWindow;
        const preventOverflow = this.cellProperties.preventOverflow;
        const helperDom = Handsontable.dom;
        // eslint-disable-next-line no-mixed-operators
        if (isWindowAScrollableElement ||
            // eslint-disable-next-line no-mixed-operators
            !isWindowAScrollableElement && (preventOverflow || preventOverflow === 'horizontal')) {
                return false;
            }

        const textareaOffset = helperDom.offset(this.TEXTAREA);
        const textareaHeight = helperDom.outerHeight(this.TEXTAREA);
        const dropdownHeight = this.getDropdownHeight();
        const trimmingContainerScrollTop = trimmingContainer.scrollTop;
        const headersHeight = helperDom.outerHeight(this.hot.view._wt.wtTable.THEAD);
        const containerOffset = helperDom.offset(trimmingContainer);
        const spaceAbove = textareaOffset.top - containerOffset.top - headersHeight + trimmingContainerScrollTop;
        const spaceBelow = trimmingContainer.scrollHeight - spaceAbove - headersHeight - textareaHeight;
        const flipNeeded = dropdownHeight > spaceBelow && spaceAbove > spaceBelow;

        if (flipNeeded) {
            this.flipDropdown(dropdownHeight);
        } else {
            this.unfilpDropdown();
        }

        this.limitDropdownIfNeeded(flipNeeded ? spaceAbove : spaceBelow, dropdownHeight);

        return flipNeeded;
    }

    limitDropdownIfNeeded(spaceAvailable, dropdownHeight) {
        if (dropdownHeight > spaceAvailable) {
            let tempHeight = 0;
            let i = 0;
            let lastRowHeight = 0;
            let height = null;

            do {
                lastRowHeight = this.htEditor.getRowHeight(i) || this.htEditor.view._wt.getSettings('defaultRowHeight');
                tempHeight += lastRowHeight;
                i += 1;
            } while (tempHeight < spaceAvailable);

            height = tempHeight - lastRowHeight;

            if (this.htEditor.flipped) {
                this.htEditor.rootElement.style.top = `${parseInt(this.htEditor.rootElement.style.top, 10) + dropdownHeight - height}px`;
            }

            this.setDropdownHeight(tempHeight - lastRowHeight);
        }
    }

    flipDropdown(dropdownHeight) {
        const dropdownStyle = this.htEditor.rootElement.style;

        dropdownStyle.position = 'absolute';
        dropdownStyle.top = `${-dropdownHeight}px`;

        this.htEditor.flipped = true;
    }

    unfilpDropdown() {
        const dropdownStyle = this.htEditor.rootElement.style;

        dropdownStyle.position = 'absolute';
        dropdownStyle.top = '';

        this.htEditor.flipped = void 0;
    }

    updateDropdownHeight() {
        const currentDropdownWidth = this.hot.getColWidth(3) + Handsontable.dom.getScrollbarWidth(this.hot.rootDocument) + 100;
        const trimDropdown = this.cellProperties.trimDropdown;



        this.htEditor.updateSettings({
            height: this.getDropdownHeight(),
            width: trimDropdown ? void 0 : currentDropdownWidth
        });

        this.htEditor.view._wt.wtTable.alignOverlaysWithTrimmingContainer();
    }

    setDropdownHeight(height) {
        this.htEditor.updateSettings({
            height
        });
    }

    highlightBestMatchingChoice(index) {
        if (typeof index === 'number') {
            this.htEditor.selectCell(index, 0, void 0, void 0, void 0, false);
        } else {
            this.htEditor.deselectCell();
        }
    }

    getDropdownHeight() {
        const firstRowHeight = this.htEditor.getInstance().getRowHeight(0) || 40;
        const visibleRows = this.cellProperties.visibleRows;
        const columnHeaderHeight = + this.htEditor.view._wt.wtTable.getColumnHeaderHeight() + 15;
        
        return this.strippedChoices.length >= visibleRows ? 
        (visibleRows * firstRowHeight + columnHeaderHeight) 
        : (this.strippedChoices.length * firstRowHeight + columnHeaderHeight) + 8;
    }

    stripValueIfNeeded(value) {
        return this.stripValuesIfNeeded([value])[0];
    }

    stripValuesIfNeeded(values) {
        const { allowHtml } = this.cellProperties;

        const stringifiedValues = Handsontable.helper.arrayMap(values, value => Handsontable.helper.stringify(value));
        const strippedValues = Handsontable.helper.arrayMap(stringifiedValues, value => (allowHtml ? value : Handsontable.helper.stripTags(value)));

        return strippedValues;
    }

    onBeforeKeyDown(event) {
        const priv = privatePool.get(this);
        const KEY_CODES = Handsontable.helper.KEY_CODES;

        priv.skipOne = false;

        if (Handsontable.helper.isPrintableChar(event.keyCode) || event.keyCode === KEY_CODES.BACKSPACE ||
            event.keyCode === KEY_CODES.DELETE || event.keyCode === KEY_CODES.INSERT) {
            let timeOffset = 10;

            if (event.keyCode === KEY_CODES.C && (event.ctrlKey || event.metaKey)) {
                return;
            }

            if (!this.isOpened()) {
                timeOffset += 10;
            }

            if (this.htEditor) {
                this.hot._registerTimeout(() => {
                    this.queryChoices(this.TEXTAREA.value);
                    priv.skipOne = true;
                }, timeOffset);
            }
        }
    }

    sortByRelevance = function(value, choices, caseSensitive) {
        const choicesRelevance = [];
        const result = [];
        const valueLength = value.length;
        let choicesCount = choices.length;
        let charsLeft;
        let currentItem;
        let i;
        let valueIndex;
    
        if (valueLength === 0) {
          for (i = 0; i < choicesCount; i++) {
            result.push(i);
          }
    
          return result;
        }
    
        for (i = 0; i < choicesCount; i++) {
          currentItem = Handsontable.helper.stripTags(Handsontable.helper.stringify(choices[i].fullname));
    
          if (caseSensitive) {
            valueIndex = currentItem.indexOf(value);
          } else {
            const locale = this.cellProperties.locale;
    
            valueIndex = currentItem.toLocaleLowerCase(locale).indexOf(value.toLocaleLowerCase(locale));
          }
    
          if (valueIndex !== -1) {
            charsLeft = currentItem.length - valueIndex - valueLength;
    
            choicesRelevance.push({
              baseIndex: i,
              index: valueIndex,
              charsLeft,
              value: currentItem
            });
          }
        }
    
        choicesRelevance.sort((a, b) => {
    
          if (b.index === -1) {
            return -1;
          }
          if (a.index === -1) {
            return 1;
          }
    
          if (a.index < b.index) {
            return -1;
          } else if (b.index < a.index) {
            return 1;
          } else if (a.index === b.index) {
            if (a.charsLeft < b.charsLeft) {
              return -1;
            } else if (a.charsLeft > b.charsLeft) {
              return 1;
            }
          }
    
          return 0;
        });
    
        for (i = 0, choicesCount = choicesRelevance.length; i < choicesCount; i++) {
          result.push(choicesRelevance[i].baseIndex);
        }
        return result;
      }
}

export default AutocompleteTableEditor;