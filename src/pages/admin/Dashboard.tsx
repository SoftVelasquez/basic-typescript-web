import { useEffect, useState } from 'react';
import {
  Film,
  Tv,
  Users,
  Eye,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Stats {
  totalMovies: number;
  totalSeries: number;
  totalUsers: number;
  totalViews: number;
  recentContent: any[];
  recentUsers: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalMovies: 0,
    totalSeries: 0,
    totalUsers: 0,
    totalViews: 0,
    recentContent: [],
    recentUsers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const contentRef = collection(db, 'content');
      const contentSnapshot = await getDocs(contentRef);
      const allContent = contentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const movies = allContent.filter((c: any) => c.media_type === 'movie');
      const series = allContent.filter((c: any) => c.media_type === 'tv');

      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const totalUsers = usersSnapshot.size;

      const recentContentQuery = query(
        collection(db, 'content'),
        orderBy('imported_at', 'desc'),
        limit(5)
      );
      const recentContentSnapshot = await getDocs(recentContentQuery);
      const recentContent = recentContentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const recentUsersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      const recentUsers = recentUsersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const clicksRef = collection(db, 'posterClicks');
      const clicksSnapshot = await getDocs(clicksRef);
      let totalViews = 0;
      clicksSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        totalViews += data.count || 0;
      });

      setStats({
        totalMovies: movies.length,
        totalSeries: series.length,
        totalUsers,
        totalViews,
        recentContent,
        recentUsers,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Películas',
      value: stats.totalMovies,
      icon: Film,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Series',
      value: stats.totalSeries,
      icon: Tv,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Usuarios',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Vistas Totales',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Resumen general de la plataforma</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="bg-[#1a1a1a] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{card.title}</p>
                  <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a1a] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              Contenido Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentContent.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay contenido reciente</p>
              ) : (
                stats.recentContent.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 bg-[#0a0a0a] rounded-lg"
                  >
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                        alt={item.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gray-800 rounded flex items-center justify-center">
                        <Film className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{item.title}</p>
                      <p className="text-gray-500 text-sm">
                        {item.media_type === 'movie' ? 'Película' : 'Serie'} •{' '}
                        {item.vote_average?.toFixed(1)} ★
                      </p>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {item.imported_at?.toDate
                        ? new Date(item.imported_at.toDate()).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              Usuarios Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay usuarios recientes</p>
              ) : (
                stats.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-3 bg-[#0a0a0a] rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{user.email}</p>
                      <p className="text-gray-500 text-sm">
                        {user.displayName || 'Sin nombre'}
                      </p>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {user.createdAt?.toDate
                        ? new Date(user.createdAt.toDate()).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="/admin/import"
              className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="p-3 bg-red-600/20 rounded-lg">
                <Film className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-white font-medium">Importar Contenido</p>
                <p className="text-gray-500 text-sm">Añadir películas o series</p>
              </div>
            </a>
            <a
              href="/admin/users"
              className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="p-3 bg-green-600/20 rounded-lg">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-white font-medium">Gestionar Usuarios</p>
                <p className="text-gray-500 text-sm">Ver y editar usuarios</p>
              </div>
            </a>
            <a
              href="/admin/messages"
              className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-white font-medium">Ver Mensajes</p>
                <p className="text-gray-500 text-sm">Soporte y consultas</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
