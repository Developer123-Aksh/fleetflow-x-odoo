import PropTypes from 'prop-types';

function KPI({ title, value, color }) {
  return (
    <div className="kpi-card" style={{ '--accent': color }}>
      <div className="kpi-top">
        <span className="kpi-title">{title}</span>
        <div className="kpi-dot" style={{ background: color }}></div>
      </div>
      <h2 className="kpi-value">{value}</h2>
    </div>
  );
}

KPI.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: function(props, propName, componentName) {
    const val = props[propName];
    if (typeof val !== 'string') {
      return new Error(`${propName} in ${componentName} must be a string like '#10b981'.`);
    }
    // simple hex color check
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
      return new Error(`${propName} in ${componentName} should be a valid hex color (e.g. '#10b981').`);
    }
    return null;
  }
};

KPI.defaultProps = {
  color: '#10b981',
};

export default KPI;