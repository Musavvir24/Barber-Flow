import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../utils/api.jsx';
import './Auth.css';

const COUNTRIES_DATA = {
  'Afghanistan': { timezone: 'Asia/Kabul', code: '+93', flag: '🇦🇫' },
  'Albania': { timezone: 'Europe/Tirane', code: '+355', flag: '🇦🇱' },
  'Algeria': { timezone: 'Africa/Algiers', code: '+213', flag: '🇩🇿' },
  'Andorra': { timezone: 'Europe/Andorra', code: '+376', flag: '🇦🇩' },
  'Angola': { timezone: 'Africa/Luanda', code: '+244', flag: '🇦🇴' },
  'Antigua and Barbuda': { timezone: 'America/Antigua', code: '+1268', flag: '🇦🇬' },
  'Argentina': { timezone: 'America/Buenos_Aires', code: '+54', flag: '🇦🇷' },
  'Armenia': { timezone: 'Asia/Yerevan', code: '+374', flag: '🇦🇲' },
  'Australia': { timezone: 'Australia/Sydney', code: '+61', flag: '🇦🇺' },
  'Austria': { timezone: 'Europe/Vienna', code: '+43', flag: '🇦🇹' },
  'Azerbaijan': { timezone: 'Asia/Baku', code: '+994', flag: '🇦🇿' },
  'Bahamas': { timezone: 'America/Nassau', code: '+1242', flag: '🇧🇸' },
  'Bahrain': { timezone: 'Asia/Bahrain', code: '+973', flag: '🇧🇭' },
  'Bangladesh': { timezone: 'Asia/Dhaka', code: '+880', flag: '🇧🇩' },
  'Barbados': { timezone: 'America/Barbados', code: '+1246', flag: '🇧🇧' },
  'Belarus': { timezone: 'Europe/Minsk', code: '+375', flag: '🇧🇾' },
  'Belgium': { timezone: 'Europe/Brussels', code: '+32', flag: '🇧🇪' },
  'Belize': { timezone: 'America/Belize', code: '+501', flag: '🇧🇿' },
  'Benin': { timezone: 'Africa/Porto-Novo', code: '+229', flag: '🇧🇯' },
  'Bhutan': { timezone: 'Asia/Thimphu', code: '+975', flag: '🇧🇹' },
  'Bolivia': { timezone: 'America/La_Paz', code: '+591', flag: '🇧🇴' },
  'Bosnia and Herzegovina': { timezone: 'Europe/Sarajevo', code: '+387', flag: '🇧🇦' },
  'Botswana': { timezone: 'Africa/Gaborone', code: '+267', flag: '🇧🇼' },
  'Brazil': { timezone: 'America/Sao_Paulo', code: '+55', flag: '🇧🇷' },
  'Brunei': { timezone: 'Asia/Brunei', code: '+673', flag: '🇧🇳' },
  'Bulgaria': { timezone: 'Europe/Sofia', code: '+359', flag: '🇧🇬' },
  'Burkina Faso': { timezone: 'Africa/Ouagadougou', code: '+226', flag: '🇧🇫' },
  'Burundi': { timezone: 'Africa/Bujumbura', code: '+257', flag: '🇧🇮' },
  'Cambodia': { timezone: 'Asia/Phnom_Penh', code: '+855', flag: '🇰🇭' },
  'Cameroon': { timezone: 'Africa/Douala', code: '+237', flag: '🇨🇲' },
  'Canada': { timezone: 'America/Toronto', code: '+1', flag: '🇨🇦' },
  'Cape Verde': { timezone: 'Atlantic/Cape_Verde', code: '+238', flag: '🇨🇻' },
  'Central African Republic': { timezone: 'Africa/Bangui', code: '+236', flag: '🇨🇫' },
  'Chad': { timezone: 'Africa/Ndjamena', code: '+235', flag: '🇹🇩' },
  'Chile': { timezone: 'America/Santiago', code: '+56', flag: '🇨🇱' },
  'China': { timezone: 'Asia/Shanghai', code: '+86', flag: '🇨🇳' },
  'Colombia': { timezone: 'America/Bogota', code: '+57', flag: '🇨🇴' },
  'Comoros': { timezone: 'Indian/Comoro', code: '+269', flag: '🇰🇲' },
  'Congo': { timezone: 'Africa/Brazzaville', code: '+242', flag: '🇨🇬' },
  'Costa Rica': { timezone: 'America/Costa_Rica', code: '+506', flag: '🇨🇷' },
  'Croatia': { timezone: 'Europe/Zagreb', code: '+385', flag: '🇭🇷' },
  'Cuba': { timezone: 'America/Havana', code: '+53', flag: '🇨🇺' },
  'Cyprus': { timezone: 'Europe/Nicosia', code: '+357', flag: '🇨🇾' },
  'Czech Republic': { timezone: 'Europe/Prague', code: '+420', flag: '🇨🇿' },
  'Democratic Republic of Congo': { timezone: 'Africa/Kinshasa', code: '+243', flag: '🇨🇩' },
  'Denmark': { timezone: 'Europe/Copenhagen', code: '+45', flag: '🇩🇰' },
  'Djibouti': { timezone: 'Africa/Djibouti', code: '+253', flag: '🇩🇯' },
  'Dominica': { timezone: 'America/Dominica', code: '+1767', flag: '🇩🇲' },
  'Dominican Republic': { timezone: 'America/Santo_Domingo', code: '+1829', flag: '🇩🇴' },
  'Ecuador': { timezone: 'America/Guayaquil', code: '+593', flag: '🇪🇨' },
  'Egypt': { timezone: 'Africa/Cairo', code: '+20', flag: '🇪🇬' },
  'El Salvador': { timezone: 'America/El_Salvador', code: '+503', flag: '🇸🇻' },
  'Equatorial Guinea': { timezone: 'Africa/Malabo', code: '+240', flag: '🇬🇶' },
  'Eritrea': { timezone: 'Africa/Asmara', code: '+291', flag: '🇪🇷' },
  'Estonia': { timezone: 'Europe/Tallinn', code: '+372', flag: '🇪🇪' },
  'Ethiopia': { timezone: 'Africa/Addis_Ababa', code: '+251', flag: '🇪🇹' },
  'Fiji': { timezone: 'Pacific/Fiji', code: '+679', flag: '🇫🇯' },
  'Finland': { timezone: 'Europe/Helsinki', code: '+358', flag: '🇫🇮' },
  'France': { timezone: 'Europe/Paris', code: '+33', flag: '🇫🇷' },
  'Gabon': { timezone: 'Africa/Libreville', code: '+241', flag: '🇬🇦' },
  'Gambia': { timezone: 'Africa/Banjul', code: '+220', flag: '🇬🇲' },
  'Georgia': { timezone: 'Asia/Tbilisi', code: '+995', flag: '🇬🇪' },
  'Germany': { timezone: 'Europe/Berlin', code: '+49', flag: '🇩🇪' },
  'Ghana': { timezone: 'Africa/Accra', code: '+233', flag: '🇬🇭' },
  'Greece': { timezone: 'Europe/Athens', code: '+30', flag: '🇬🇷' },
  'Grenada': { timezone: 'America/Grenada', code: '+1473', flag: '🇬🇩' },
  'Guatemala': { timezone: 'America/Guatemala', code: '+502', flag: '🇬🇹' },
  'Guinea': { timezone: 'Africa/Conakry', code: '+224', flag: '🇬🇳' },
  'Guinea-Bissau': { timezone: 'Africa/Bissau', code: '+245', flag: '🇬🇼' },
  'Guyana': { timezone: 'America/Guyana', code: '+592', flag: '🇬🇾' },
  'Haiti': { timezone: 'America/Port-au-Prince', code: '+509', flag: '🇭🇹' },
  'Honduras': { timezone: 'America/Tegucigalpa', code: '+504', flag: '🇭🇳' },
  'Hong Kong': { timezone: 'Asia/Hong_Kong', code: '+852', flag: '🇭🇰' },
  'Hungary': { timezone: 'Europe/Budapest', code: '+36', flag: '🇭🇺' },
  'Iceland': { timezone: 'Atlantic/Reykjavik', code: '+354', flag: '🇮🇸' },
  'India': { timezone: 'Asia/Kolkata', code: '+91', flag: '🇮🇳' },
  'Indonesia': { timezone: 'Asia/Jakarta', code: '+62', flag: '🇮🇩' },
  'Iran': { timezone: 'Asia/Tehran', code: '+98', flag: '🇮🇷' },
  'Iraq': { timezone: 'Asia/Baghdad', code: '+964', flag: '🇮🇶' },
  'Ireland': { timezone: 'Europe/Dublin', code: '+353', flag: '🇮🇪' },
  'Israel': { timezone: 'Asia/Jerusalem', code: '+972', flag: '🇮🇱' },
  'Italy': { timezone: 'Europe/Rome', code: '+39', flag: '🇮🇹' },
  'Ivory Coast': { timezone: 'Africa/Abidjan', code: '+225', flag: '🇨🇮' },
  'Jamaica': { timezone: 'America/Jamaica', code: '+1876', flag: '🇯🇲' },
  'Japan': { timezone: 'Asia/Tokyo', code: '+81', flag: '🇯🇵' },
  'Jordan': { timezone: 'Asia/Amman', code: '+962', flag: '🇯🇴' },
  'Kazakhstan': { timezone: 'Asia/Almaty', code: '+7', flag: '🇰🇿' },
  'Kenya': { timezone: 'Africa/Nairobi', code: '+254', flag: '🇰🇪' },
  'Kiribati': { timezone: 'Pacific/Kiritimati', code: '+686', flag: '🇰🇮' },
  'Kuwait': { timezone: 'Asia/Kuwait', code: '+965', flag: '🇰🇼' },
  'Kyrgyzstan': { timezone: 'Asia/Bishkek', code: '+996', flag: '🇰🇬' },
  'Laos': { timezone: 'Asia/Vientiane', code: '+856', flag: '🇱🇦' },
  'Latvia': { timezone: 'Europe/Riga', code: '+371', flag: '🇱🇻' },
  'Lebanon': { timezone: 'Asia/Beirut', code: '+961', flag: '🇱🇧' },
  'Lesotho': { timezone: 'Africa/Maseru', code: '+266', flag: '🇱🇸' },
  'Liberia': { timezone: 'Africa/Monrovia', code: '+231', flag: '🇱🇷' },
  'Libya': { timezone: 'Africa/Tripoli', code: '+218', flag: '🇱🇾' },
  'Liechtenstein': { timezone: 'Europe/Vaduz', code: '+423', flag: '🇱🇮' },
  'Lithuania': { timezone: 'Europe/Vilnius', code: '+370', flag: '🇱🇹' },
  'Luxembourg': { timezone: 'Europe/Luxembourg', code: '+352', flag: '🇱🇺' },
  'Macao': { timezone: 'Asia/Macau', code: '+853', flag: '🇲🇴' },
  'Macedonia': { timezone: 'Europe/Skopje', code: '+389', flag: '🇲🇰' },
  'Madagascar': { timezone: 'Indian/Antananarivo', code: '+261', flag: '🇲🇬' },
  'Malawi': { timezone: 'Africa/Lilongwe', code: '+265', flag: '🇲🇼' },
  'Malaysia': { timezone: 'Asia/Kuala_Lumpur', code: '+60', flag: '🇲🇾' },
  'Maldives': { timezone: 'Indian/Maldives', code: '+960', flag: '🇲🇻' },
  'Mali': { timezone: 'Africa/Bamako', code: '+223', flag: '🇲🇱' },
  'Malta': { timezone: 'Europe/Malta', code: '+356', flag: '🇲🇹' },
  'Marshall Islands': { timezone: 'Pacific/Majuro', code: '+692', flag: '🇲🇭' },
  'Mauritania': { timezone: 'Africa/Nouakchott', code: '+222', flag: '🇲🇷' },
  'Mauritius': { timezone: 'Indian/Mauritius', code: '+230', flag: '🇲🇺' },
  'Mexico': { timezone: 'America/Mexico_City', code: '+52', flag: '🇲🇽' },
  'Micronesia': { timezone: 'Pacific/Pohnpei', code: '+691', flag: '🇫🇲' },
  'Moldova': { timezone: 'Europe/Chisinau', code: '+373', flag: '🇲🇩' },
  'Monaco': { timezone: 'Europe/Monaco', code: '+377', flag: '🇲🇨' },
  'Mongolia': { timezone: 'Asia/Ulaanbaatar', code: '+976', flag: '🇲🇳' },
  'Montenegro': { timezone: 'Europe/Podgorica', code: '+382', flag: '🇲🇪' },
  'Morocco': { timezone: 'Africa/Casablanca', code: '+212', flag: '🇲🇦' },
  'Mozambique': { timezone: 'Africa/Maputo', code: '+258', flag: '🇲🇿' },
  'Myanmar': { timezone: 'Asia/Yangon', code: '+95', flag: '🇲🇲' },
  'Namibia': { timezone: 'Africa/Windhoek', code: '+264', flag: '🇳🇦' },
  'Nauru': { timezone: 'Pacific/Nauru', code: '+674', flag: '🇳🇷' },
  'Nepal': { timezone: 'Asia/Kathmandu', code: '+977', flag: '🇳🇵' },
  'Netherlands': { timezone: 'Europe/Amsterdam', code: '+31', flag: '🇳🇱' },
  'New Zealand': { timezone: 'Pacific/Auckland', code: '+64', flag: '🇳🇿' },
  'Nicaragua': { timezone: 'America/Managua', code: '+505', flag: '🇳🇮' },
  'Niger': { timezone: 'Africa/Niamey', code: '+227', flag: '🇳🇪' },
  'Nigeria': { timezone: 'Africa/Lagos', code: '+234', flag: '🇳🇬' },
  'North Korea': { timezone: 'Asia/Pyongyang', code: '+850', flag: '🇰🇵' },
  'Norway': { timezone: 'Europe/Oslo', code: '+47', flag: '🇳🇴' },
  'Oman': { timezone: 'Asia/Muscat', code: '+968', flag: '🇴🇲' },
  'Pakistan': { timezone: 'Asia/Karachi', code: '+92', flag: '🇵🇰' },
  'Palau': { timezone: 'Pacific/Palau', code: '+680', flag: '🇵🇼' },
  'Palestine': { timezone: 'Asia/Hebron', code: '+970', flag: '🇵🇸' },
  'Panama': { timezone: 'America/Panama', code: '+507', flag: '🇵🇦' },
  'Papua New Guinea': { timezone: 'Pacific/Port_Moresby', code: '+675', flag: '🇵🇬' },
  'Paraguay': { timezone: 'America/Asuncion', code: '+595', flag: '🇵🇾' },
  'Peru': { timezone: 'America/Lima', code: '+51', flag: '🇵🇪' },
  'Philippines': { timezone: 'Asia/Manila', code: '+63', flag: '🇵🇭' },
  'Poland': { timezone: 'Europe/Warsaw', code: '+48', flag: '🇵🇱' },
  'Portugal': { timezone: 'Europe/Lisbon', code: '+351', flag: '🇵🇹' },
  'Qatar': { timezone: 'Asia/Qatar', code: '+974', flag: '🇶🇦' },
  'Republic of the Congo': { timezone: 'Africa/Brazzaville', code: '+242', flag: '🇨🇬' },
  'Romania': { timezone: 'Europe/Bucharest', code: '+40', flag: '🇷🇴' },
  'Russia': { timezone: 'Europe/Moscow', code: '+7', flag: '🇷🇺' },
  'Rwanda': { timezone: 'Africa/Kigali', code: '+250', flag: '🇷🇼' },
  'Saint Kitts and Nevis': { timezone: 'America/St_Kitts', code: '+1869', flag: '🇰🇳' },
  'Saint Lucia': { timezone: 'America/St_Lucia', code: '+1758', flag: '🇱🇨' },
  'Saint Vincent and the Grenadines': { timezone: 'America/St_Vincent', code: '+1784', flag: '🇻🇨' },
  'Samoa': { timezone: 'Pacific/Apia', code: '+685', flag: '🇼🇸' },
  'San Marino': { timezone: 'Europe/San_Marino', code: '+378', flag: '🇸🇲' },
  'Sao Tome and Principe': { timezone: 'Africa/Sao_Tome', code: '+239', flag: '🇸🇹' },
  'Saudi Arabia': { timezone: 'Asia/Riyadh', code: '+966', flag: '🇸🇦' },
  'Senegal': { timezone: 'Africa/Dakar', code: '+221', flag: '🇸🇳' },
  'Serbia': { timezone: 'Europe/Belgrade', code: '+381', flag: '🇷🇸' },
  'Seychelles': { timezone: 'Indian/Mahe', code: '+248', flag: '🇸🇨' },
  'Sierra Leone': { timezone: 'Africa/Freetown', code: '+232', flag: '🇸🇱' },
  'Singapore': { timezone: 'Asia/Singapore', code: '+65', flag: '🇸🇬' },
  'Slovakia': { timezone: 'Europe/Bratislava', code: '+421', flag: '🇸🇰' },
  'Slovenia': { timezone: 'Europe/Ljubljana', code: '+386', flag: '🇸🇮' },
  'Solomon Islands': { timezone: 'Pacific/Guadalcanal', code: '+677', flag: '🇸🇧' },
  'Somalia': { timezone: 'Africa/Mogadishu', code: '+252', flag: '🇸🇴' },
  'South Africa': { timezone: 'Africa/Johannesburg', code: '+27', flag: '🇿🇦' },
  'South Korea': { timezone: 'Asia/Seoul', code: '+82', flag: '🇰🇷' },
  'South Sudan': { timezone: 'Africa/Juba', code: '+211', flag: '🇸🇸' },
  'Spain': { timezone: 'Europe/Madrid', code: '+34', flag: '🇪🇸' },
  'Sri Lanka': { timezone: 'Asia/Colombo', code: '+94', flag: '🇱🇰' },
  'Sudan': { timezone: 'Africa/Khartoum', code: '+249', flag: '🇸🇩' },
  'Suriname': { timezone: 'America/Paramaribo', code: '+597', flag: '🇸🇷' },
  'Sweden': { timezone: 'Europe/Stockholm', code: '+46', flag: '🇸🇪' },
  'Switzerland': { timezone: 'Europe/Zurich', code: '+41', flag: '🇨🇭' },
  'Syria': { timezone: 'Asia/Damascus', code: '+963', flag: '🇸🇾' },
  'Taiwan': { timezone: 'Asia/Taipei', code: '+886', flag: '🇹🇼' },
  'Tajikistan': { timezone: 'Asia/Dushanbe', code: '+992', flag: '🇹🇯' },
  'Tanzania': { timezone: 'Africa/Dar_es_Salaam', code: '+255', flag: '🇹🇿' },
  'Thailand': { timezone: 'Asia/Bangkok', code: '+66', flag: '🇹🇭' },
  'Timor-Leste': { timezone: 'Asia/Dili', code: '+670', flag: '🇹🇱' },
  'Togo': { timezone: 'Africa/Lome', code: '+228', flag: '🇹🇬' },
  'Tonga': { timezone: 'Pacific/Tongatapu', code: '+676', flag: '🇹🇴' },
  'Trinidad and Tobago': { timezone: 'America/Trinidad', code: '+1868', flag: '🇹🇹' },
  'Tunisia': { timezone: 'Africa/Tunis', code: '+216', flag: '🇹🇳' },
  'Turkey': { timezone: 'Europe/Istanbul', code: '+90', flag: '🇹🇷' },
  'Turkmenistan': { timezone: 'Asia/Ashkhabad', code: '+993', flag: '🇹🇲' },
  'Tuvalu': { timezone: 'Pacific/Funafuti', code: '+688', flag: '🇹🇻' },
  'Uganda': { timezone: 'Africa/Kampala', code: '+256', flag: '🇺🇬' },
  'Ukraine': { timezone: 'Europe/Kyiv', code: '+380', flag: '🇺🇦' },
  'United Arab Emirates': { timezone: 'Asia/Dubai', code: '+971', flag: '🇦🇪' },
  'United Kingdom': { timezone: 'Europe/London', code: '+44', flag: '🇬🇧' },
  'United States': { timezone: 'America/New_York', code: '+1', flag: '🇺🇸' },
  'Uruguay': { timezone: 'America/Montevideo', code: '+598', flag: '🇺🇾' },
  'Uzbekistan': { timezone: 'Asia/Tashkent', code: '+998', flag: '🇺🇿' },
  'Vanuatu': { timezone: 'Pacific/Efate', code: '+678', flag: '🇻🇺' },
  'Vatican City': { timezone: 'Europe/Rome', code: '+379', flag: '🇻🇦' },
  'Venezuela': { timezone: 'America/Caracas', code: '+58', flag: '🇻🇪' },
  'Vietnam': { timezone: 'Asia/Ho_Chi_Minh', code: '+84', flag: '🇻🇳' },
  'Yemen': { timezone: 'Asia/Aden', code: '+967', flag: '🇾🇪' },
  'Zambia': { timezone: 'Africa/Lusaka', code: '+260', flag: '🇿🇲' },
  'Zimbabwe': { timezone: 'Africa/Harare', code: '+263', flag: '🇿🇼' },
};

const Signup = ({ onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    shopName: '',
    shopSlug: '',
    email: '',
    password: '',
    country: 'India',
    mobileNumber: '',
    openingTime: '09:00',
    closingTime: '18:00',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleShopNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      shopName: name,
      shopSlug: !prev.shopSlug || prev.shopSlug === generateSlug(prev.shopName) 
        ? generateSlug(name) 
        : prev.shopSlug
    }));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const countryData = COUNTRIES_DATA[formData.country];
      const response = await auth.signup({
        shopName: formData.shopName,
        shopSlug: formData.shopSlug,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        phone: formData.mobileNumber,
        countryCode: countryData.code,
        timezone: countryData.timezone,
        openingTime: formData.openingTime + ':00',
        closingTime: formData.closingTime + ':00',
      });

      // Show success message
      setSuccess('✓ Account created successfully! Please login with your email and password.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const currentCountryData = COUNTRIES_DATA[formData.country];

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1><span className="meaze-blue">Meaze</span><span className="book-green">book</span></h1>
            <p>Create Your Shop Account</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Shop Name */}
            <div className="form-group">
              <label htmlFor="shopName">Shop Name</label>
              <input
                id="shopName"
                type="text"
                placeholder="My shop"
                name="shopName"
                value={formData.shopName}
                onChange={handleShopNameChange}
                required
              />
            </div>

            {/* Shop Slug */}
            <div className="form-group">
              <label htmlFor="shopSlug">Shop URL Slug</label>
              <div className="slug-input">
                <span className="slug-prefix">Meazebook.com/book/</span>
                <input
                  id="shopSlug"
                  type="text"
                  placeholder="my-shop"
                  name="shopSlug"
                  value={formData.shopSlug}
                  onChange={handleChange}
                  required
                />
              </div>
              <small>Customers will use this to book appointments</small>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0',
                    opacity: showPassword ? 1 : 0.4,
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    transition: 'opacity 0.2s ease'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  👁️
                </button>
              </div>
            </div>

            {/* Country */}
            <div className="form-group">
              <label htmlFor="country">Select Country</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              >
                {Object.keys(COUNTRIES_DATA).map(country => (
                  <option key={country} value={country}>
                    {COUNTRIES_DATA[country].flag} {country}
                  </option>
                ))}
              </select>
              <small>Used to set your shop's timezone and dial code</small>
            </div>

            {/* Mobile Number */}
            <div className="form-group">
              <label htmlFor="mobileNumber">Mobile Number</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{
                  backgroundColor: '#f5f5f5',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  minWidth: '70px',
                  textAlign: 'center',
                  color: '#2c3e50'
                }}>
                  {currentCountryData.code}
                </div>
                <input
                  id="mobileNumber"
                  type="tel"
                  placeholder="1234567890"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  required
                  style={{ flex: 1 }}
                />
              </div>
              <small>Enter mobile number without country code</small>
            </div>

            {/* Opening Time */}
            <div className="form-group">
              <label htmlFor="openingTime">Opening Time</label>
              <input
                id="openingTime"
                type="time"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleChange}
                required
              />
            </div>

            {/* Closing Time */}
            <div className="form-group">
              <label htmlFor="closingTime">Closing Time</label>
              <input
                id="closingTime"
                type="time"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in here</Link>
            </p>
          </div>
        </div>

        <div className="auth-side">
          <h2>Get Started in Minutes</h2>
          <ul>
            <li>✓ Free Trail-Easy To Use</li>
            <li>✓ Manage staff and services</li>
            <li>✓ Accept online bookings</li>
            <li>✓ Send email confirmations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Signup;
