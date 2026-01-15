import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Users, UserPlus, Calendar, Settings, LogOut,
  Menu, X, Notebook, BarChart, User
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import logo from '../../logo.png';
import api from '../../services/api';

const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [userName, setUserName] = React.useState('');
  const [parceiroLogo, setParceiroLogo] = React.useState<string | null>(null);
  const dispatch = useDispatch();

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/api/auth/verify');
        setUserName(response.data.user.nome || '');
        setParceiroLogo(response.data.user.parceiroLogo || null);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserName('');
        setParceiroLogo(null);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  const userType = localStorage.getItem('userType');
  const parceiroMenu = [
    { name: 'Filiais', icon: UserPlus, path: '/filiais' },
    { name: 'Revendedores', icon: UserPlus, path: '/revendedores' },
    { name: 'Relatório de Vendas', icon: BarChart, path: '/relatorio-vendas' },
  ]

  const filialMenu = [
    { name: 'Revendedores', icon: UserPlus, path: '/revendedores' },
    { name: 'Relatório de Vendas', icon: BarChart, path: '/relatorio-vendas' },
  ]

  const revendedorMenu = [
    { name: 'Beneficiários', icon: UserPlus, path: '/beneficiarios' },
  ]

  const adminMenu = [
    { name: 'Beneficiários', icon: UserPlus, path: '/beneficiarios' },
    { name: 'Agendamentos', icon: Calendar, path: '/agendamentos' },
    { name: 'Encaminhamentos', icon: Calendar, path: '/encaminhamentos' },
    { name: 'Profissionais', icon: Users, path: '/profissionais' },
    { name: 'Parceiros', icon: UserPlus, path: '/parceiros' },
    { name: 'Filiais', icon: UserPlus, path: '/filiais' },
    { name: 'Revendedores', icon: UserPlus, path: '/revendedores' },
    { name: 'Relatório de Vendas', icon: BarChart, path: '/relatorio-vendas' },
    { name: 'Comissões', icon: BarChart, path: '/relatorio-comissoes' },
    { name: 'Gestão do Site', icon: Notebook, path: '/site' },
    { name: 'Configurações', icon: Settings, path: '/configuracoes' },
  ];

  const menuItems = userType === 'PARCEIRO' 
    ? parceiroMenu 
    : userType === 'FILIAL' 
      ? filialMenu 
      : userType === 'REVENDEDOR'
        ? revendedorMenu
        : adminMenu;

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full justify-center items-center">
          <div className="flex justify-center items-center pt-2 pb-2">
            <img src={logo} alt="Logo" className="w-40" />
          </div>
          <div className="text-center">
           
            {(userName || parceiroLogo) && (
              <div className="flex items-center justify-center gap-2 text-sm text-[#34495e] font-medium mt-1 truncate max-w-[180px] mx-auto">
                {parceiroLogo ? (
                  <img
                    src={parceiroLogo}
                    alt="Logo do Parceiro"
                    className="w-12 h-12 p-1 rounded-full object-contain border-2 border-[#00c9cb]"
                  />
                ) : (
                  <User size={16} />
                )}
                <div className="flex flex-col items-start">
                 <span className="text-xs font-semibold text-[#00c9cb] tracking-widest uppercase">
              {userType}
            </span>
                <span className="truncate whitespace-nowrap w-[100px] overflow-hidden text-ellipsis text-left">{userName}</span>
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 px-4 py-6">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-1 mb-2 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-[#00c9cb] text-white' 
                    : 'text-[#34495e] bg-[#f6f6f6]'
                  }`
                }
              >
                <item.icon size={20} className="mr-3" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-[#34495e] hover:bg-[#f6f6f6] transition-colors text-sm rounded-md mb-6"
          >
            <LogOut size={18} className="mr-2" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;