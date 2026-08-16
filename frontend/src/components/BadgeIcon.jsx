import {
  FiAward, FiTarget, FiZap, FiStar, FiTrendingUp, FiLock
} from 'react-icons/fi';
import { IoRocketOutline } from 'react-icons/io5';
import './BadgeIcon.css';

const badgeIconMap = {
  trophy: <FiAward size={28} />,
  target: <FiTarget size={28} />,
  zap: <FiZap size={28} />,
  rocket: <IoRocketOutline size={28} />,
  star: <FiStar size={28} />,
  flame: <FiTrendingUp size={28} />,
};

export default function BadgeIcon({ badge }) {
  return (
    <div className={`badge-icon-card ${badge.earned ? 'earned' : 'locked'}`}>
      <div className="badge-emoji">
        {badgeIconMap[badge.icon] || <FiAward size={28} />}
      </div>
      <div className="badge-name">{badge.name}</div>
      <div className="badge-desc">{badge.description}</div>
      {!badge.earned && <div className="badge-lock"><FiLock size={12} /></div>}
    </div>
  );
}
