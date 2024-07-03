<Eye className="mr-2 h-4 w-4" /> {isPreviewVisible ? 'Hide' : 'Show'} Preview
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isPreviewVisible ? 'Hide' : 'Show'} Live Preview</TooltipContent>
          </Tooltip>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={() => handleZoom(Math.min(200, zoom + 25))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>
          <span className="text-white text-sm">{zoom}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={exportHTML}>
                <Save className="mr-2 h-4 w-4" /> Export HTML
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export as HTML</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={() => toast({ title: "Saving...", description: "Your project is being saved locally." })}>
                <RefreshCw className="mr-2 h-4 w-4" /> Auto-Save
              </Button>
            </TooltipTrigger>
            <TooltipContent>Auto-Save (every 5 minutes)</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Offline Mode Indicator */}
      <div className="fixed bottom-4 right-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`w-4 h-4 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </TooltipTrigger>
          <TooltipContent>{navigator.onLine ? 'Online' : 'Offline'}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

// Offline capabilities
const OfflineManager = {
  saveProject: (project: any) => {
    localStorage.setItem('aiWebsiteBuilderProject', JSON.stringify(project));
  },

  loadProject: (): any => {
    const savedProject = localStorage.getItem('aiWebsiteBuilderProject');
    return savedProject ? JSON.parse(savedProject) : null;
  },

  clearProject: () => {
    localStorage.removeItem('aiWebsiteBuilderProject');
  }
};

// Wrapper component to handle offline functionality
const AIWebsiteBuilderWrapper: React.FC = () => {
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const savedProject = OfflineManager.loadProject();
    if (savedProject) {
      setProject(savedProject);
    }
  }, []);

  useEffect(() => {
    const autoSave = setInterval(() => {
      if (project) {
        OfflineManager.saveProject(project);
        toast({ title: "Auto-Saved", description: "Your project has been automatically saved." });
      }
    }, 5 * 60 * 1000); // Auto-save every 5 minutes

    return () => clearInterval(autoSave);
  }, [project]);

  const handleProjectChange = (newProject: any) => {
    setProject(newProject);
    OfflineManager.saveProject(newProject);
  };

  return (
    <AIWebsiteBuilder
      initialProject={project}
      onProjectChange={handleProjectChange}
    />
  );
};

export default AIWebsiteBuilderWrapper;
