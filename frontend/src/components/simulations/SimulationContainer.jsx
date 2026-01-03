import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import SimulationDashboard from './SimulationDashboard';
import SimulationSetup from './SimulationSetup';
import SimulationTask from './SimulationTask';
import SimulationReflection from './SimulationReflection';

export default function SimulationContainer() {
    const { token, user } = useAuth();
    const [step, setStep] = useState(1); // 1: Dashboard, 2: Setup, 3: Task, 4: Reflection
    const [loading, setLoading] = useState(true);
    const [recommendation, setRecommendation] = useState(null);
    const [selectedSimulation, setSelectedSimulation] = useState(null);
    const [activeAttempt, setActiveAttempt] = useState(null);
    const [lastResult, setLastResult] = useState(null);

    useEffect(() => {
        fetchRecommendation();
    }, []);

    const fetchRecommendation = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/simulations/recommendation', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setRecommendation(data);
            } else {
                console.error("Failed to fetch recommendation:", data.error);
            }
        } catch (err) {
            console.error("Failed to fetch recommendation:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewSim = async (simId) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/simulations/${simId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setSelectedSimulation(data);
                setStep(2);
            } else {
                alert("Error: " + (data.error || "Failed to load simulation"));
            }
        } catch (err) {
            console.error("Failed to fetch simulation details:", err);
        } finally {
            setLoading(false);
        }
    };

    const startSimulation = async (simId) => {
        try {
            const res = await fetch(`/api/simulations/${simId}/start`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setActiveAttempt(data);
                setStep(3);
            } else {
                alert("Error: " + (data.error || "Failed to start simulation"));
            }
        } catch (err) {
            alert("Error starting simulation: " + err.message);
        }
    };

    const submitSimulation = async (attemptId, decisions, justification) => {
        try {
            const res = await fetch(`/api/simulations/${attemptId}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ decisions, justification })
            });
            const data = await res.json();
            if (res.ok) {
                setLastResult(data);
                setStep(4);
            } else {
                alert("Error: " + (data.error || "Failed to evaluate simulation"));
            }
        } catch (err) {
            alert("Error submitting simulation: " + err.message);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading simulations...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {step === 1 && (
                <SimulationDashboard
                    data={recommendation}
                    onViewSim={handleViewSim}
                />
            )}
            {step === 2 && selectedSimulation && (
                <SimulationSetup
                    sim={selectedSimulation}
                    onStart={() => startSimulation(selectedSimulation.id)}
                    onBack={() => setStep(1)}
                />
            )}
            {step === 3 && activeAttempt && (
                <SimulationTask
                    attempt={activeAttempt}
                    onSubmit={submitSimulation}
                    onBack={() => setStep(1)}
                />
            )}
            {step === 4 && lastResult && (
                <SimulationReflection
                    result={lastResult}
                    sim={selectedSimulation}
                    user={user}
                    onBack={() => setStep(1)}
                    onDone={() => {
                        setStep(1);
                        fetchRecommendation();
                    }}
                />
            )}
        </div>
    );
}
