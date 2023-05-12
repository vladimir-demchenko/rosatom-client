import { useState, useRef, useMemo, useEffect } from 'react';
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css';
import ArticleService from '../services/ArticleService';

export function debounce(fn, ms) {
    let timeoutId = null;
  
    function debounced(...args) {
      if (typeof timeoutId === "number") {
        clearTimeout(timeoutId);
      }
  
      timeoutId = setTimeout(() => {
        timeoutId = null;
        fn.apply(null, args);
      }, ms);
    }
  
    debounced.cancel = () => {
      if (typeof timeoutId !== "number") {
        return;
      }
      clearTimeout(timeoutId);
    };
  
    return debounced;
  }

const StartPage = () => {
    const editorRef = useRef(null);
    const isTextEdited = useRef(false);
    const [docsDesc, setDocsDesc] = useState('');

    // const saveTextToStorage = useMemo(
    //     () => 
    //         debounce((text) => {
    //           apiSave(text);
    //         }, 500),
    //     []
    // );

    // const apiSave = async (text) => {
    //     await ArticleService.update(1, text);
    // }

    const getQuilData = async (value) => {
        // isTextEdited.current = true;
        // const editor = editorRef.current.getEditor();
        // const unprivilegeEditor = editorRef.current.makeUnprivilegedEditor(editor);
        // const text =  unprivilegeEditor.getText();
        // saveTextToStorage(text);
        // await ArticleService.update(1, value);
        // getArticle();
        setDocsDesc(value);
    }

    // const getArticle = async () => {
    //     await ArticleService.getText()
    //     .then(res => {
    //         if (isTextEdited.current) {
    //             return;
    //         }
    //         setDocsDesc(res.data.text);
    //     })
    //     .catch(e => {
    //         console.log(e);
    //     })
    // }

    // useEffect(() => {
    //     getArticle();
    // }, []);

    return (
        <div>
            <ReactQuill
                ref={editorRef}
                className='react-quill'
                value={docsDesc}
                onChange={getQuilData}
            />
        </div>
    );
};

export default StartPage;