import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { LoginRoute } from "./routes/login";
import { DashboardRoute } from "./routes/dashboard";
import { ArticleHomeRoute } from "./routes/article";
import { ReadingMainRoute } from "./routes/read";
import { VocabRoute } from "./routes/vocab";
import { SentenceRoute } from "./routes/sentence";
import { ReadingRoute } from "./routes/reading";
import { QuotesRoute } from "./routes/quotes";
import { PronunciationRoute } from "./routes/pronunciation";
import { MeReportRoute } from "./routes/meReport";
import { TeacherLoginRoute } from "./routes/teacherLogin";
import { TeacherDashboardRoute } from "./routes/teacherDashboard";
import { TeacherArticlesRoute } from "./routes/teacherArticles";
import { TeacherArticleEditRoute } from "./routes/teacherArticleEdit";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route path="/a/:articleId" element={<ArticleHomeRoute />} />
        <Route path="/a/:articleId/read" element={<ReadingMainRoute />} />
        <Route path="/a/:articleId/vocab" element={<VocabRoute />} />
        <Route path="/a/:articleId/sentence" element={<SentenceRoute />} />
        <Route path="/a/:articleId/pronunciation" element={<PronunciationRoute />} />
        <Route path="/a/:articleId/reading" element={<ReadingRoute />} />
        <Route path="/a/:articleId/quotes" element={<QuotesRoute />} />
        <Route path="/me/report" element={<MeReportRoute />} />
        <Route path="/t/login" element={<TeacherLoginRoute />} />
        <Route path="/t/dashboard" element={<TeacherDashboardRoute />} />
        <Route path="/t/articles" element={<TeacherArticlesRoute />} />
        <Route path="/t/articles/:articleId/edit" element={<TeacherArticleEditRoute />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
