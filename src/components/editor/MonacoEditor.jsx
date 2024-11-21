import { useTheme } from '@/context/ThemeContext';
import Editor from '@monaco-editor/react';

export function MonacoEditor({
  value,
  onChange,
  language = 'javascript',
  ...props
}) {
  const { theme } = useTheme();

  const beforeMount = monaco => {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
    });
  };

  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      defaultValue={value}
      onChange={onChange}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: 'on',
        tabSize: 2,
        insertSpaces: true,
        ...props.options,
      }}
      beforeMount={beforeMount}
      loading={
        <div className="h-full w-full flex items-center justify-center">
          Loading editor...
        </div>
      }
    />
  );
}

export default MonacoEditor;
