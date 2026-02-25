import { useEffect, useState } from 'react';
import {
  Save,
  RefreshCw,
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface WebConfig {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  defaultLanguage: string;
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  analyticsEnabled: boolean;
  adsEnabled: boolean;
}

const defaultConfig: WebConfig = {
  siteName: 'StreamFlix',
  siteDescription: 'Tu plataforma de streaming favorita',
  maintenanceMode: false,
  registrationEnabled: true,
  defaultLanguage: 'es',
  primaryColor: '#e50914',
  logoUrl: '',
  faviconUrl: '',
  analyticsEnabled: true,
  adsEnabled: false,
};

export default function AdminSettings() {
  const [config, setConfig] = useState<WebConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'web_config', 'settings');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setConfig({ ...defaultConfig, ...docSnap.data() });
      }
    } catch (err) {
      console.error('Error fetching config:', err);
      toast.error('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, 'web_config', 'settings');
      await setDoc(docRef, config);
      toast.success('Configuración guardada correctamente');
    } catch (err) {
      console.error('Error saving config:', err);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Configuración</h1>
        <p className="text-gray-400 mt-1">
          Personaliza la configuración de la plataforma
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-[#1a1a1a] border-gray-800">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="features">Funciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 space-y-6">
            <div className="space-y-2">
              <Label className="text-white">Nombre del Sitio</Label>
              <Input
                value={config.siteName}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, siteName: e.target.value }))
                }
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Descripción</Label>
              <Input
                value={config.siteDescription}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, siteDescription: e.target.value }))
                }
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Idioma Predeterminado</Label>
              <select
                value={config.defaultLanguage}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, defaultLanguage: e.target.value }))
                }
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white rounded-md px-3 py-2"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 space-y-6">
            <div className="space-y-2">
              <Label className="text-white">Color Principal</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, primaryColor: e.target.value }))
                  }
                  className="w-16 h-10 p-1 bg-[#0a0a0a] border-gray-700"
                />
                <Input
                  value={config.primaryColor}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, primaryColor: e.target.value }))
                  }
                  className="flex-1 bg-[#0a0a0a] border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">URL del Logo</Label>
              <Input
                value={config.logoUrl}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, logoUrl: e.target.value }))
                }
                placeholder="https://ejemplo.com/logo.png"
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">URL del Favicon</Label>
              <Input
                value={config.faviconUrl}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, faviconUrl: e.target.value }))
                }
                placeholder="https://ejemplo.com/favicon.ico"
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Modo Mantenimiento</Label>
                <p className="text-gray-500 text-sm">
                  Muestra una página de mantenimiento a los usuarios
                </p>
              </div>
              <Switch
                checked={config.maintenanceMode}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, maintenanceMode: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Registro de Usuarios</Label>
                <p className="text-gray-500 text-sm">
                  Permitir que nuevos usuarios se registren
                </p>
              </div>
              <Switch
                checked={config.registrationEnabled}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, registrationEnabled: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Analytics</Label>
                <p className="text-gray-500 text-sm">
                  Habilitar seguimiento de analytics
                </p>
              </div>
              <Switch
                checked={config.analyticsEnabled}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, analyticsEnabled: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Publicidad</Label>
                <p className="text-gray-500 text-sm">
                  Mostrar anuncios en la plataforma
                </p>
              </div>
              <Switch
                checked={config.adsEnabled}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, adsEnabled: checked }))
                }
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4 pt-6 border-t border-gray-800">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
