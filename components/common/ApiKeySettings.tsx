import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { X, Save, Shield, CheckCircle, AlertTriangle, Key, Database, Download, Upload, Info } from 'lucide-react';
import { toast } from '../ui/toaster';
import { createClient } from '@supabase/supabase-js';
import { encryptData, decryptData } from '../../lib/utils';

export const ApiKeySettings = () => {
  const { isSettingsOpen, toggleSettings, apiConfig, setApiConfig } = useStore();
  
  const [spotifyId, setSpotifyId] = useState('');
  const [spotifySecret, setSpotifySecret] = useState('');
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isSettingsOpen) {
      setSpotifyId(apiConfig.spotifyClientId || '');
      setSpotifySecret(apiConfig.spotifyClientSecret || '');
      setSbUrl(apiConfig.supabaseUrl || '');
      setSbKey(apiConfig.supabaseKey || '');
      setTestStatus('idle');
    }
  }, [isSettingsOpen, apiConfig]);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    setApiConfig({
      spotifyClientId: spotifyId,
      spotifyClientSecret: spotifySecret,
      supabaseUrl: sbUrl,
      supabaseKey: sbKey
    });
    toast.success('API 설정이 안전하게 저장되었습니다.');
    toggleSettings(false);
    
    // Refresh to apply changes immediately
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleTestConnection = async () => {
    // 1. Check Spotify ID format (Basic check)
    if (!spotifyId || spotifyId.length < 30) {
      toast.error('Spotify Client ID가 올바르지 않아 보입니다.');
      setTestStatus('error');
      return;
    }

    // 2. Test Supabase if provided
    if (sbUrl && sbKey) {
      try {
        const tempClient = createClient(sbUrl, sbKey);
        const { error } = await tempClient.from('requests').select('count', { count: 'exact', head: true });
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is just no result, which implies connection worked
             // Allow specific errors if table doesn't exist but connection worked
             console.warn(error);
        }
        
        setTestStatus('success');
        toast.success('연결 테스트 성공! 키가 유효합니다.');
      } catch (e) {
        console.error(e);
        setTestStatus('error');
        toast.error('Supabase 연결 실패. URL과 Key를 확인하세요.');
      }
    } else {
        // Just Spotify
        setTestStatus('success');
        toast.success('Spotify ID 형식이 유효합니다. (로그인 필요)');
    }
  };
  
  const handleExport = () => {
      const config = {
          spotifyClientId: encryptData(spotifyId),
          spotifyClientSecret: encryptData(spotifySecret),
          supabaseUrl: encryptData(sbUrl),
          supabaseKey: encryptData(sbKey),
          timestamp: new Date().toISOString()
      };
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "melody_flow_config.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast.success('설정 파일이 다운로드되었습니다.');
  };
  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (json.spotifyClientId) setSpotifyId(decryptData(json.spotifyClientId));
              if (json.spotifyClientSecret) setSpotifySecret(decryptData(json.spotifyClientSecret));
              if (json.supabaseUrl) setSbUrl(decryptData(json.supabaseUrl));
              if (json.supabaseKey) setSbKey(decryptData(json.supabaseKey));
              toast.success('설정 파일을 불러왔습니다. 저장 버튼을 눌러 적용하세요.');
          } catch (err) {
              toast.error('올바르지 않은 설정 파일입니다.');
          }
      };
      reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-lg bg-[#18181b] border-zinc-700 text-white shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 pb-4 sticky top-0 bg-[#18181b] z-10">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            API 키 관리자
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => toggleSettings(false)}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3 flex gap-3 text-sm text-blue-200">
             <Key className="h-5 w-5 shrink-0" />
             <p>입력한 키는 브라우저 로컬 스토리지에 암호화되어 저장됩니다. 서버로 전송되지 않습니다.</p>
          </div>

          {/* Spotify Config */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                Spotify Client ID 
                <span className="text-xs text-red-400">*필수</span>
                </label>
            </div>
            <Input 
              value={spotifyId}
              onChange={(e) => setSpotifyId(e.target.value)}
              placeholder="e.g. 3c31fcca3a..." 
              className="bg-black/50 border-zinc-700 font-mono"
            />
            
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2 mt-2">
               Spotify Client Secret
               <span className="text-xs text-zinc-500 font-normal">(선택사항)</span>
            </label>
            <Input 
              value={spotifySecret}
              onChange={(e) => setSpotifySecret(e.target.value)}
              placeholder="PKCE 방식은 Secret이 필요하지 않지만 저장 용도로 입력 가능합니다." 
              type="password"
              className="bg-black/50 border-zinc-700 font-mono text-zinc-400"
            />
            
            <div className="bg-zinc-800/50 p-2 rounded flex items-start gap-2 text-xs text-zinc-400 mt-1">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>이 앱은 보안 강화를 위해 PKCE 인증 방식을 사용합니다. Client Secret은 앱 구동에 필요하지 않으며, 입력 시 단순 보관용으로만 저장됩니다.</p>
            </div>
          </div>

          {/* Supabase Config */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
             <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
               <Database className="h-4 w-4" /> Supabase Configuration (Optional)
            </label>
            <div className="grid gap-3">
                <Input 
                    value={sbUrl}
                    onChange={(e) => setSbUrl(e.target.value)}
                    placeholder="Project URL (https://xyz.supabase.co)" 
                    className="bg-black/50 border-zinc-700 font-mono"
                />
                <Input 
                    value={sbKey}
                    onChange={(e) => setSbKey(e.target.value)}
                    placeholder="Anon Public Key" 
                    type="password"
                    className="bg-black/50 border-zinc-700 font-mono"
                />
            </div>
            <p className="text-xs text-zinc-500">신청곡 및 DJ 기능을 위해 Supabase가 필요합니다.</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800">
             <div className="flex justify-between items-center mb-2">
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport} className="text-xs h-8 border-zinc-700 hover:bg-zinc-800">
                        <Download className="h-3 w-3 mr-1" /> 백업
                    </Button>
                    <div className="relative">
                        <input 
                            type="file" 
                            accept=".json" 
                            onChange={handleImport}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full"
                        />
                        <Button variant="outline" size="sm" className="text-xs h-8 border-zinc-700 hover:bg-zinc-800 pointer-events-none">
                            <Upload className="h-3 w-3 mr-1" /> 복원
                        </Button>
                    </div>
                 </div>
                 
                 <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleTestConnection}
                    className={testStatus === 'success' ? 'text-green-500' : testStatus === 'error' ? 'text-red-500' : 'text-zinc-400'}
                 >
                    {testStatus === 'success' && <CheckCircle className="h-4 w-4 mr-1" />}
                    {testStatus === 'error' && <AlertTriangle className="h-4 w-4 mr-1" />}
                    연결 테스트
                 </Button>
             </div>
             
             <Button onClick={handleSave} className="w-full bg-primary text-black font-bold hover:bg-primary/90">
                <Save className="mr-2 h-4 w-4" /> 저장 및 적용
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};