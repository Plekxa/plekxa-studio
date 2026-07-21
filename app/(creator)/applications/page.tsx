export default function ApplicationsPage() {
  return (
    <div className="studio-page">

      <section className="studio-page-heading">
        <span>Applications</span>
        <h1>My Applications</h1>
        <p>
          Track every application you've submitted to Plekxa productions.
        </p>
      </section>

      <div className="studio-panel">

        <div className="studio-empty-state">

          <h3>No applications yet</h3>

          <p>
            Browse current opportunities and apply to productions that match your
            skills.
          </p>

          <a href="/projects">
            Browse opportunities
          </a>

        </div>

      </div>

    </div>
  );
}