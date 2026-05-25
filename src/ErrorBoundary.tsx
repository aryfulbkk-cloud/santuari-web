import React from "react"; 

export class ErrorBoundary extends React.Component<any, {hasError: boolean, error: any}> { 
  constructor(props: any) { 
    super(props); 
    this.state = { hasError: false, error: null }; 
  } 
  
  static getDerivedStateFromError(error: any) { 
    return { hasError: true, error }; 
  } 
  
  render() { 
    if (this.state.hasError) { 
      return (
        <div className="p-10 text-red-500 bg-white min-h-screen">
          <h1 className="text-xl font-bold mb-4">Aplikasi Mengalami Error (Crash)</h1>
          <pre className="text-xs bg-red-50 p-4 rounded border border-red-200 overflow-auto whitespace-pre-wrap">
            {this.state.error?.toString()}
          </pre>
          <pre className="text-[10px] mt-4 text-gray-500 overflow-auto max-h-96">
            {this.state.error?.stack}
          </pre>
        </div>
      ); 
    } 
    return this.props.children; 
  } 
}
