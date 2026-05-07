import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Bell, RefreshCcw } from "lucide-react";
import Sidebar from "./components/Sidebar.jsx";
import NotificationDrawer from "./components/NotificationDrawer.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Pipeline from "./pages/Pipeline.jsx";
import Review from "./pages/Review.jsx";
import Calendar from "./pages/Calendar.jsx";
import Settings from "./pages/Settings.jsx";
import Login from "./pages/Login.jsx";
import * as contentApi from "./api/contentApi.js";

export default function App() {
  const [appState, setAppState] = useState({
    posts: [],
    reviewers: [],
    settings: {
      approvedAngles: [],
      ctaTemplates: [],
    },
    activities: [],
  });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [role, setRole] = useState("VP Brand");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { posts, reviewers, settings } = appState;

  const activities = useMemo(
    () => [...appState.activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [appState.activities],
  );

  useEffect(() => {
    let active = true;
    contentApi
      .readAppState()
      .then((state) => {
        if (!active) return;
        setAppState(state);
        setApiError("");
      })
      .catch((error) => {
        if (!active) return;
        setApiError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function addManualPost(url) {
    setAppState(await contentApi.addManualPost(url));
    navigate("/pipeline");
  }

  async function runMockAgent(postId) {
    setAppState(await contentApi.runAgent(postId));
    navigate(`/review/${postId}`);
  }

  async function updateApproval(postId, decision, note) {
    setAppState(await contentApi.updateApproval(postId, { decision, note }));
  }

  async function updateAsset(postId, assetId, copy) {
    setAppState(await contentApi.updateAsset(postId, assetId, { copy }));
  }

  async function regenerateAsset(postId, assetId, editNotes) {
    setAppState(await contentApi.regenerateAsset(postId, assetId, { editNotes }));
  }

  async function schedulePost(postId, payload) {
    setAppState(await contentApi.schedulePost(postId, payload));
  }

  async function resetDemo() {
    setAppState(await contentApi.resetAppState());
    navigate("/dashboard");
  }

  if (!loggedIn && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname === "/login") {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar role={role} setRole={setRole} />
        <main className="main-panel">
          <header className="topbar">
            <div>
              <p className="section-label">TargetBoard Content Manager</p>
              <h1>Loading workspace</h1>
            </div>
          </header>
          <section className="page-stack">
            <article className="panel">
              <h2>Connecting to content store...</h2>
            </article>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar role={role} setRole={setRole} />
      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="section-label">TargetBoard Content Manager</p>
            <h1>{routeTitle(location.pathname)}</h1>
            {apiError ? <span className="api-error">{apiError}</span> : null}
          </div>
          <div className="topbar-actions">
            <button className="icon-text-button" type="button" onClick={resetDemo}>
              <RefreshCcw size={16} />
              Reset demo
            </button>
            <button className="notification-button" type="button" onClick={() => setDrawerOpen(true)}>
              <Bell size={18} />
              <span>{activities.length}</span>
            </button>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard posts={posts} role={role} activities={activities} />} />
          <Route
            path="/pipeline"
            element={<Pipeline posts={posts} onAddPost={addManualPost} onRunAgent={runMockAgent} />}
          />
          <Route
            path="/review/:id"
            element={
              <Review
                posts={posts}
                role={role}
                onApproval={updateApproval}
                onAssetSave={updateAsset}
                onRegenerate={regenerateAsset}
                onSchedule={schedulePost}
              />
            }
          />
          <Route path="/calendar" element={<Calendar posts={posts} />} />
          <Route
            path="/settings"
            element={
              <Settings
                reviewers={reviewers}
                angles={settings.approvedAngles}
                ctas={settings.ctaTemplates}
                settings={settings}
              />
            }
          />
        </Routes>
      </main>
      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} activities={activities} role={role} />
    </div>
  );
}

function routeTitle(pathname) {
  if (pathname.startsWith("/pipeline")) return "Pipeline";
  if (pathname.startsWith("/review")) return "Review";
  if (pathname.startsWith("/calendar")) return "Calendar";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Dashboard";
}
