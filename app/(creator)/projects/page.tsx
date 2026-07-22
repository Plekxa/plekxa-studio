import Link from "next/link";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type ProjectsPageProps = {
  searchParams: Promise<{
    search?: string;
    department?: string;
  }>;
};

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const filters = await searchParams;
  const search = filters.search?.trim() ?? "";
  const department = filters.department?.trim() ?? "";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let projectsQuery = supabase
    .from("projects")
    .select(
      "id, title, slug, summary, department, deadline, created_at"
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (search) {
    projectsQuery = projectsQuery.or(
      `title.ilike.%${search}%,summary.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  if (department) {
    projectsQuery = projectsQuery.eq("department", department);
  }

  const [
  { data: projects, error: projectsError },
  { data: applications },
  { data: departmentRows },
] = await Promise.all([
  projectsQuery,

  supabase
  .from("creator_applications")
  .select("project_id, status")
  .eq("creator_id", user.id)
  .in("status", ["pending", "under_review", "accepted"]),

  supabase
    .from("projects")
    .select("department")
    .eq("status", "open"),
]);

  const appliedProjects = new Map(
    applications?.map((application) => [
      application.project_id,
      application.status,
    ]) ?? []
  );

  const departments = Array.from(
    new Set(
      departmentRows
        ?.map((project) => project.department)
        .filter(Boolean) ?? []
    )
  ).sort();

  return (
    <main className="projects-marketplace-page">
      <div className="container">
        <div className="projects-marketplace-heading">
          <div>
            <span className="eyebrow">CREATOR OPPORTUNITIES</span>
            <h1>Join a Plekxa project.</h1>
            <p>
              Search active productions and apply to opportunities that match
              your skills, experience and interests.
            </p>
          </div>

          <Link className="button" href="/pitch">
            Pitch your own project
          </Link>
        </div>

        <form className="projects-filter-bar" method="GET">
          <label className="projects-search-field">
            <Search size={18} />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search projects..."
            />
          </label>

          <select
            name="department"
            defaultValue={department}
            aria-label="Filter by department"
          >
            <option value="">All departments</option>

            {departments.map((departmentName) => (
              <option value={departmentName} key={departmentName}>
                {departmentName}
              </option>
            ))}
          </select>

          <button className="button" type="submit">
            Apply filters
          </button>

          {search || department ? (
            <Link className="projects-clear-filter" href="/projects">
              Clear
            </Link>
          ) : null}
        </form>

        {projectsError ? (
          <div className="projects-empty-state">
            <h2>We couldn’t load the projects.</h2>
            <p>Please try again shortly.</p>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="projects-marketplace-grid">
            {projects.map((project) => {
              const applicationStatus = appliedProjects.get(project.id);

              return (
                <article className="marketplace-project-card" key={project.id}>
                  <div className="marketplace-project-meta">
                    <span>{project.department}</span>

                    {applicationStatus ? (
                      <span className="project-applied-badge">
                        Applied · {applicationStatus.replaceAll("_", " ")}
                      </span>
                    ) : (
                      <span className="project-open-badge">Open</span>
                    )}
                  </div>

                  <h2>{project.title}</h2>
                  <p>{project.summary}</p>

                  {project.deadline ? (
                    <small>
                      Deadline:{" "}
                      {new Date(project.deadline).toLocaleDateString()}
                    </small>
                  ) : (
                    <small>Applications currently open</small>
                  )}

                  <div
  style={{
    display: "flex",
    gap: "12px",
    marginTop: "18px",
    flexWrap: "wrap",
  }}
>
  <Link
    className="button button-secondary"
    href={`/projects/${project.slug}`}
  >
    View Project
  </Link>

  
</div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="projects-empty-state">
            <h2>No matching projects.</h2>
            <p>Try changing your search or department filter.</p>
          </div>
        )}
      </div>
    </main>
  );
}