import React, { useState, useEffect, useRef } from 'react';
import { Layout, Sidebar, Image, Type, Box, List, Link, Menu, ChevronDown, Plus, Trash2, Eye, Code, Save, Upload, Settings, Undo, Redo, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

// Simulated offline LLM (in reality, this would be a more complex integration)
const offlineLLM = {
  generate: async (prompt: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
    return `<div class="generated-content">${prompt}</div>`;
  }
};

interface Element {
  id: number;
  type: string;
  content: string;
  styles?: {
    [key: string]: string;
  };
}

const AIWebsiteBuilder: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [viewMode, setViewMode] = useState('edit');
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<Element[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elements.length > 0 && historyIndex < history.length - 1) {
      setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), elements]);
      setHistoryIndex(prevIndex => prevIndex + 1);
    }
  }, [elements]);

  const addElement = (type: string) => {
    const newElement: Element = { id: Date.now(), type, content: `New ${type}`, styles: {} };
    setElements(prevElements => [...prevElements, newElement]);
    setSelectedElement(newElement);
    addToHistory([...elements, newElement]);
  };

  const updateElement = (id: number, updates: Partial<Element>) => {
    setElements(prevElements =>
      prevElements.map(el => el.id === id ? { ...el, ...updates } : el)
    );
  };

  const deleteElement = (id: number) => {
    setElements(prevElements => prevElements.filter(el => el.id !== id));
    setSelectedElement(null);
    addToHistory(elements.filter(el => el.id !== id));
  };

  const handleAIGenerate = async () => {
    try {
      const generatedContent = await offlineLLM.generate(aiPrompt);
      addElement('ai-generated');
      updateElement(elements[elements.length - 1].id, { content: generatedContent });
      toast({
        title: "AI Content Generated",
        description: "New content has been added to your page.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderElement = (element: Element) => {
    const commonProps = {
      style: element.styles,
      className: `element ${selectedElement?.id === element.id ? 'ring-2 ring-blue-500' : ''}`,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedElement(element);
      },
    };

    switch (element.type) {
      case 'heading':
        return React.createElement(
          element.styles?.level || 'h2',
          commonProps,
          element.content
        );
      case 'paragraph':
        return <p {...commonProps}>{element.content}</p>;
      case 'image':
        return <img src={element.content} alt="User uploaded" {...commonProps} />;
      case 'ai-generated':
        return <div {...commonProps} dangerouslySetInnerHTML={{ __html: element.content }} />;
      default:
        return null;
    }
  };

  const addToHistory = (newState: Element[]) => {
    setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), newState]);
    setHistoryIndex(prevIndex => prevIndex + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prevIndex => prevIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prevIndex => prevIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const handleZoom = (newZoom: number) => {
    setZoom(newZoom);
    if (editorRef.current) {
      editorRef.current.style.transform = `scale(${newZoom / 100})`;
    }
  };

  const exportHTML = () => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Exported Website</title>
        <style>
          /* Add any global styles here */
        </style>
      </head>
      <body>
        ${elements.map(element => {
          const elementHtml = renderElement(element);
          return elementHtml ? elementHtml.outerHTML : '';
        }).join('')}
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported_website.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Element Palette */}
      <div className="w-16 bg-gray-800 p-2">
        <TooltipProvider>
          {[
            { icon: Type, label: 'Add Heading', onClick: () => addElement('heading') },
            { icon: Layout, label: 'Add Paragraph', onClick: () => addElement('paragraph') },
            { icon: Image, label: 'Add Image', onClick: () => addElement('image') },
            { icon: Box, label: 'Add AI Content', onClick: () => setAiPrompt('') },
          ].map(({ icon: Icon, label, onClick }, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onClick} className="w-full mb-2">
                  <Icon className="h-6 w-6 text-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <ScrollArea className="flex-1 p-4 bg-white">
          <div
            ref={editorRef}
            className="min-h-full w-full transition-transform duration-200 ease-in-out"
            style={{ transformOrigin: 'top left' }}
          >
            {elements.map(element => (
              <div key={element.id} className="relative group">
                {renderElement(element)}
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" onClick={() => deleteElement(element.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Right Sidebar - Properties & AI */}
        <div className="w-80 bg-gray-200 p-4 overflow-y-auto">
          <Tabs defaultValue="properties">
            <TabsList className="w-full">
              <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
              <TabsTrigger value="ai" className="flex-1">AI Assistant</TabsTrigger>
            </TabsList>
            <TabsContent value="properties">
              {selectedElement && (
                <Card>
                  <CardHeader>
                    <CardTitle>Element Properties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label>Content</Label>
                    {selectedElement.type === 'paragraph' ? (
                      <Textarea
                        value={selectedElement.content}
                        onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                        className="mb-2"
                      />
                    ) : (
                      <Input
                        value={selectedElement.content}
                        onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                        className="mb-2"
                      />
                    )}
                    {selectedElement.type === 'heading' && (
                      <>
                        <Label>Level</Label>
                        <Select
                          value={selectedElement.styles?.level || 'h2'}
                          onValueChange={(value) => updateElement(selectedElement.id, { styles: { ...selectedElement.styles, level: value } })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((level) => (
                              <SelectItem key={level} value={level}>{level.toUpperCase()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                    <Label>Font Size</Label>
                    <Slider
                      min={8}
                      max={72}
                      step={1}
                      value={[parseInt(selectedElement.styles?.fontSize || '16')]}
                      onValueChange={([value]) => updateElement(selectedElement.id, { styles: { ...selectedElement.styles, fontSize: `${value}px` } })}
                      className="mb-2"
                    />
                    <Label>Color</Label>
                    <Input
                      type="color"
                      value={selectedElement.styles?.color || '#000000'}
                      onChange={(e) => updateElement(selectedElement.id, { styles: { ...selectedElement.styles, color: e.target.value } })}
                      className="mb-2"
                    />
                    <Button variant="destructive" onClick={() => deleteElement(selectedElement.id)} className="mt-4">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Element
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="ai">
              <Card>
                <CardHeader>
                  <CardTitle>AI Content Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label>Prompt</Label>
                  <Textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe the content you want..."
                    className="mb-2"
                  />
                  <Button onClick={handleAIGenerate} className="w-full">
                    Generate Content
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="h-16 bg-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => setViewMode('edit')} className={viewMode === 'edit' ? 'bg-gray-700' : ''}>
            <Eye className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="ghost" onClick={() => setViewMode('preview')} className={viewMode === 'preview' ? 'bg-gray-700' : ''}>
            <Code className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={undo} disabled={historyIndex === 0}>
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={redo} disabled={historyIndex === history.length - 1}>
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={() => handleZoom(Math.max(25, zoom - 25))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>
          <span className