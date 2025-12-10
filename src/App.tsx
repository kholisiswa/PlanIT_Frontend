import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Projects from "./pages/Projects";
import Tags from "./pages/Tags";
import Settings from "./pages/Settings";
import ProjectDetail from "./pages/projects/ProjectDetail";
import TagTasksPage from "./pages/tags/TagTasksPage";
import CustomerServiceForm from "@/pages/CustServices";  // <-- Path harus benar

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/tasks"} component={Tasks} />
      <Route path={"/projects"} component={Projects} />
      <Route path={"/projects/:id"} component={ProjectDetail} />
      <Route path={"/tags"} component={Tags} />
      <Route path={"/tags/:id"} component={TagTasksPage} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />

      {/* Ganti dari /customer-service menjadi /help */}
      <Route path={"/help"} component={CustomerServiceForm} />

      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
