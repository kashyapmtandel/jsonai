import { useRef, useEffect } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, search } from '@codemirror/search';
import { lintGutter } from '@codemirror/lint';
import { useThemeObserver } from '../hooks/useThemeObserver';
import './CodeEditor.css';

const CodeEditor = ({ value, onChange, readOnly = false, placeholder = 'Paste your JSON here...', height = '400px', language = 'json' }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const themeCompartment = useRef(new Compartment());
  const globalTheme = useThemeObserver();

  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && onChange) {
        onChange(update.state.doc.toString());
      }
    });

    const extensions = [
      lineNumbers(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      drawSelection(),
      history(),
      lintGutter(),
      search({ top: true }),
      keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
      json(),
      themeCompartment.current.of(globalTheme === 'dark' ? oneDark : []),
      updateListener,
      EditorView.theme({
        '&': { height, fontSize: '14px', fontFamily: 'var(--font-mono)' },
        '.cm-content': { fontFamily: 'var(--font-mono)', padding: '8px 0' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-gutters': { backgroundColor: 'var(--bg-secondary)', border: 'none' },
      }),
      EditorState.readOnly.of(readOnly),
    ];

    if (placeholder && !value) {
      extensions.push(EditorView.contentAttributes.of({ 'aria-label': placeholder }));
    }

    const state = EditorState.create({
      doc: value || '',
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []); // eslint-disable-line

  // Update theme dynamically when it changes
  useEffect(() => {
    const view = viewRef.current;
    if (view) {
      view.dispatch({
        effects: themeCompartment.current.reconfigure(globalTheme === 'dark' ? oneDark : [])
      });
    }
  }, [globalTheme]);

  // Update content when value prop changes externally
  useEffect(() => {
    const view = viewRef.current;
    if (view && value !== undefined) {
      const currentValue = view.state.doc.toString();
      if (currentValue !== value) {
        view.dispatch({
          changes: { from: 0, to: currentValue.length, insert: value },
        });
      }
    }
  }, [value]);

  return (
    <div className="code-editor-wrapper">
      <div ref={editorRef} className="code-editor" />
    </div>
  );
};

export default CodeEditor;
