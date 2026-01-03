"use client"

import { useState, useEffect } from "react" 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { formSchema, FormData } from "@/lib/schema"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" 
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, RotateCcw, Zap } from "lucide-react" 
import ReactMarkdown from 'react-markdown' 

export default function WorkoutForm() {
  const [step, setStep] = useState(1)
  const [isFinalValidationActive, setIsFinalValidationActive] = useState(false)
  const [showStep2Errors, setShowStep2Errors] = useState(false)
  
  // ESTADOS PARA IA Y RESULTADO
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Analizando tu perfil...")
  const [routine, setRoutine] = useState<string | null>(null) // Guardamos la rutina aquí

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      age: "", weight: "", height: "",
      goal: "", level: "", place: "",
      equipment: "", injuries: ""
    }
  })

  const { register, handleSubmit, formState: { errors }, setValue, trigger, control, reset } = form;

  const goalValue = useWatch({ control, name: "goal" });
  const levelValue = useWatch({ control, name: "level" });
  const placeValue = useWatch({ control, name: "place" });

  // Lógica de mensajes de carga
  useEffect(() => {
    if (isLoading) {
      const messages = ["Analizando perfil...", "Optimizando rutina...", "Diseñando dieta...", "Casi listo..."];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingMessage(messages[i]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setRoutine(result.routine); // Guardamos la respuesta de la IA
      } else {
        alert("Error de la IA: " + result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  }

  const nextStep = async () => {
    let fields: (keyof FormData)[] = [];
    if (step === 1) fields = ["age", "weight", "height"];
    if (step === 2) fields = ["goal", "level"];
    
    const result = await trigger(fields);
    if (result) {
      setStep((prev) => prev + 1);
    } else if (step === 2) {
      setShowStep2Errors(true);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const resetAll = () => {
    setRoutine(null);
    setStep(1);
    reset();
  };

  // VISTA DE CARGA
  if (isLoading) {
    return (
      <Card className="w-full max-w-lg bg-zinc-900 border-zinc-800 text-white p-10 flex flex-col items-center justify-center min-h-[400px] space-y-6 shadow-2xl shadow-violet-900/40">
        <div className="relative">
            <Loader2 className="h-16 w-16 text-violet-500 animate-spin" />
            <div className="absolute inset-0 h-16 w-16 border-t-2 border-violet-500 rounded-full blur-sm animate-pulse"></div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-white tracking-wide uppercase">NeoFit AI</h3>
          <p className="text-zinc-400 animate-pulse text-sm font-medium italic">{loadingMessage}</p>
        </div>
      </Card>
    )
  }

  // VISTA DE RESULTADO (LA RUTA GENERADA)
  if (routine) {
    return (
      <div className="w-full max-w-2xl space-y-6 animate-in fade-in zoom-in duration-500">
        <Card className="bg-zinc-900 border-violet-500/30 text-zinc-100 shadow-2xl shadow-violet-950/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-900/20 to-transparent border-b border-zinc-800">
            <div className="flex items-center gap-2 text-violet-400 mb-1">
              <Zap className="w-4 h-4 fill-current" />
              <span className="text-xs font-bold uppercase tracking-tighter">Plan Generado</span>
            </div>
            <CardTitle className="text-3xl font-black italic">TU PLAN ESTRATÉGICO</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Renderizado de Markdown */}
            <div className="text-zinc-300 space-y-4">
  <ReactMarkdown
    components={{
      // 1.TÍTULOS 
      h1: ({ children }) => (
        <h1 className="text-xl font-black text-violet-400 italic mb-4 uppercase tracking-tighter border-b border-violet-900/50 pb-2">
          {children}
        </h1>
      ),
      // 2.SUBTÍTULOS
      h2: ({ children }) => (
        <h2 className="text-lg font-bold text-violet-300 mt-6 mb-2 flex items-center gap-2">
          <div className="w-1 h-5 bg-violet-600 rounded-full"></div> {children}
        </h2>
      ),
      // 3.VIÑETAS 
      ul: ({ children }) => <ul className="space-y-3 my-4 list-none">{children}</ul>,
      li: ({ children }) => (
        <li className="grid grid-cols-[auto_1fr] gap-2 items-start leading-tight">
          <span className="text-violet-500 font-bold text-lg leading-none">•</span>
          <span className="text-zinc-300">{children}</span>
        </li>
      ),
      
      strong: ({ children }) => <strong className="text-violet-400 font-bold">{children}</strong>,
      p: ({ children }) => <p className="leading-relaxed mb-2 text-sm">{children}</p>,
    }}
  >
    {routine}
  </ReactMarkdown>
</div>

            <Button 
              onClick={resetAll}
              className="mt-10 w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 py-6 text-lg font-bold transition-all"
            >
              <RotateCcw className="mr-2 w-5 h-5" /> REINICIAR Y CREAR OTRO
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // VISTA DEL FORMULARIO (POR PASOS)
  return (
    <Card className="w-full max-w-lg bg-zinc-900 border-zinc-800 text-white shadow-2xl shadow-violet-900/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-violet-400 text-2xl font-black italic tracking-tighter uppercase">Paso {step} de 3</CardTitle>
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${step >= s ? 'bg-violet-500' : 'bg-zinc-800'}`} />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={errors.age ? "text-red-400 font-bold" : "text-zinc-400"}>Edad</Label>
                  <Input {...register("age")} placeholder="Ej: 25" className={`bg-zinc-800 border-zinc-700 focus:ring-violet-500 ${errors.age ? 'border-red-500' : ''}`} />
                  {errors.age && <p className="text-[10px] text-red-500 mt-1 uppercase font-bold tracking-widest">{errors.age.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className={errors.weight ? "text-red-400 font-bold" : "text-zinc-400"}>Peso (kg)</Label>
                  <Input {...register("weight")} placeholder="Ej: 75" className={`bg-zinc-800 border-zinc-700 focus:ring-violet-500 ${errors.weight ? 'border-red-500' : ''}`} />
                  {errors.weight && <p className="text-[10px] text-red-500 mt-1 uppercase font-bold tracking-widest">{errors.weight.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label className={errors.height ? "text-red-400 font-bold" : "text-zinc-400"}>Altura (cm)</Label>
                <Input {...register("height")} placeholder="Ej: 180" className={`bg-zinc-800 border-zinc-700 focus:ring-violet-500 ${errors.height ? 'border-red-500' : ''}`} />
                {errors.height && <p className="text-[10px] text-red-500 mt-1 uppercase font-bold tracking-widest">{errors.height.message}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label className={(errors.goal && showStep2Errors) ? "text-red-400 font-bold" : "text-zinc-400"}>Objetivo Principal</Label>
                <Select value={goalValue} onValueChange={(v) => { setValue("goal", v as FormData["goal"]); if (showStep2Errors) trigger("goal"); }}>
                  <SelectTrigger className={`bg-zinc-800 border-zinc-700 ${(errors.goal && showStep2Errors) ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                    <SelectValue placeholder="Seleccioná tu objetivo" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="loss">🔥 Quemar Grasa</SelectItem>
                    <SelectItem value="gain">💪 Ganar Músculo</SelectItem>
                    <SelectItem value="strength">🏋️ Ganar Fuerza</SelectItem>
                    <SelectItem value="maintenance">⚖️ Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
                {errors.goal && showStep2Errors && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-widest">{errors.goal.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className={(errors.level && showStep2Errors) ? "text-red-400 font-bold" : "text-zinc-400"}>Nivel de Experiencia</Label>
                <Select value={levelValue} onValueChange={(v) => { setValue("level", v as FormData["level"]); if (showStep2Errors) trigger("level"); }}>
                  <SelectTrigger className={`bg-zinc-800 border-zinc-700 ${(errors.level && showStep2Errors) ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                    <SelectValue placeholder="Seleccioná tu nivel" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="beginner">Principiante (0-6 meses)</SelectItem>
                    <SelectItem value="intermediate">Intermedio (6 meses - 2 años)</SelectItem>
                    <SelectItem value="advanced">Avanzado (+2 años)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.level && showStep2Errors && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-widest">{errors.level.message}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"> 
              <div className="space-y-2">
                <Label className={(errors.place && isFinalValidationActive) ? "text-red-400 font-bold" : "text-zinc-400"}>¿Dónde entrenás?</Label>
                <Select value={placeValue} onValueChange={(v) => { setValue("place", v as FormData["place"]); if (isFinalValidationActive) trigger("place"); }}>
                  <SelectTrigger className={`bg-zinc-800 border-zinc-700 ${(errors.place && isFinalValidationActive) ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                    <SelectValue placeholder="Seleccioná un lugar" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="gym">Gimnasio Comercial</SelectItem>
                    <SelectItem value="home">En Casa</SelectItem>
                    <SelectItem value="outdoor">Parque / Calistenia</SelectItem>
                  </SelectContent>
                </Select>
                {errors.place && isFinalValidationActive && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-widest">{errors.place.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Material Disponible (Opcional)</Label>
                <Input {...register("equipment")} placeholder="Ej: Mancuernas, bandas, barra..." className="bg-zinc-800 border-zinc-700 focus:border-violet-500" />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Lesiones / Molestias (Opcional)</Label>
                <Input {...register("injuries")} placeholder="Ej: Dolor lumbar, rodilla operada..." className="bg-zinc-800 border-zinc-700 focus:border-violet-500" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800/50 gap-4">
            {step > 1 && (
              <Button type="button" variant="ghost" onClick={prevStep} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                <ArrowLeft className="mr-2 w-4 h-4" /> Atrás
              </Button>
            )}
            <div className="flex-1 flex justify-end">
              {step < 3 ? (
                <Button type="button" className="bg-violet-600 hover:bg-violet-700 px-8 font-bold transition-all" onClick={nextStep}>
                  Siguiente →
                </Button>
              ) : (
                <Button type="submit" onClick={() => setIsFinalValidationActive(true)} className="bg-violet-600 hover:bg-violet-700 px-8 font-bold shadow-lg shadow-violet-900/50 transition-all">
                  ✨ Generar Plan
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}