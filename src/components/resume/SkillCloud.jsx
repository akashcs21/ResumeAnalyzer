// SkillCloud — Word cloud / tag display of extracted skills
export default function SkillCloud({ skills }) {
  return (
    <div className="skill-cloud">
      <h3>Skills</h3>
      <div className="tags">
        {skills?.map((skill, i) => (
          <span key={i} className="tag">{skill}</span>
        ))}
      </div>
    </div>
  );
}
