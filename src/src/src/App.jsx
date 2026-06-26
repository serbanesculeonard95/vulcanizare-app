import { useState, useMemo, useEffect } from "react";
import { supabase } from "./supabase.js";

const SERVICES = [
  { id: 1, name: "Schimb anvelope", duration: 30, price: 80, icon: "🔧", desc: "Demontare, montare și echilibrare roți" },
  { id: 2, name: "Reparație pană", duration: 20, price: 40, icon: "🛠️", desc: "Identificare și reparare gaură anvelopă" },
  { id: 3, name: "Echilibrare roți", duration: 25, price: 50, icon: "⚖️", desc: "Echilibrare computerizată pentru toate roțile" },
  { id: 4, name: "Verificare presiune + TPMS", duration: 15, price: 20, icon: "📊", desc: "Control presiune și resetare senzori" },
  { id: 5, name: "Geometrie", duration: 45, price: 120, icon: "📐", desc: "Aliniere direcție și geometrie completă" },
  { id: 6, name: "Depozitare anvelope", duration: 10, price: 30, icon: "📦", desc: "Depozitare sezonieră pe sezon" },
];

const HOURS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30"];

const STAFF_PASS = "vulcan2024";

function getDateKey(date) { return date.toISOString().split("T")[0]; }
function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y, m) { let d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

const MONTHS_RO = ["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];
const DAYS_RO = ["Lu","Ma","Mi","Jo","Vi","Sâ","Du"];

export default function App() {
  const [view, setView] = useState("client");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffPass, setStaffPass] = useState("");
  const [passError, setPassError] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("bookings").select("*");
    if (!error) setBookings(data.map(b => ({ ...b, service: b.service_id })));
    setLoading(false);
  };

  const handleStaffLogin = () => {
    if (staffPass === STAFF_PASS) { setView("staff"); setPassError(false); }
    else setPassError(true);
  };

  const addBooking = async (booking) => {
    const { data, error } = await supabase.from("bookings").insert([{
      name: booking.name,
      phone: booking.phone,
      plate: booking.plate,
      service_id: booking.service,
      date: booking.date,
      time: booking.time,
      status: "confirmat"
    }]).select();
    if (!error && data) {
      setBookings(prev => [...prev, { ...data[0], service: data[0].service_id }]);
    }
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (!error) setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#F5F4F2", color: "#1C1C1E" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .btn-primary { background: #E8540A; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; cursor: pointer; transition: background 0.2s; }
        .btn-primary:hover { background: #C44308; }
        .btn-secondary { background: white; color: #1C1C1E; border: 1.5px solid #D1D0CE; padding: 10px 20px; border-radius: 8px; font-weight: 500; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { border-color: #E8540A; color: #E8540A; }
        .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        input, select { border: 1.5px solid #D1D0CE; border-radius: 8px; padding: 10px 14px; font-size: 14px; width: 100%; font-family: Inter, sans-serif; outline: none; transition: border 0.2s; background: white; }
        input:focus, select:focus { border-color: #E8540A; }
        label { font-size: 13px; font-weight: 600; color: #555; display: block; margin-bottom: 6px; }
        .tag-confirmat { background: #E8F5E9; color: #2E7D32; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .tag-finalizat { background: #E3F2FD; color: #1565C0; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .tag-anulat { background: #FFEBEE; color: #C62828; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        @media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ background: "#1C1C1E", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#E8540A", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔧</div>
          <span style={{ color: "white", fontWeight: 800, fontSize: 18 }}>VulcaPro</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: 13, background: view === "client" ? "white" : "transparent", color: view === "client" ? "#1C1C1E" : "#aaa", borderColor: view === "client" ? "white" : "#444" }} onClick={() => setView("client")}>👤 Client</button>
          <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: 13, background: view === "staff" ? "white" : "transparent", color: view === "staff" ? "#1C1C1E" : "#aaa", borderColor: view === "staff" ? "white" : "#444" }} onClick={() => view === "staff" ? null : setView("staff-login")}>🔑 Personal</button>
        </div>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 60, color: "#999" }}>Se încarcă...</div>}
      {!loading && view === "client" && <ClientView bookings={bookings} addBooking={addBooking} />}
      {!loading && view === "staff-login" && (
        <div style={{ maxWidth: 380, margin: "80px auto", padding: 24 }}>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔑</div>
            <h2 style={{ marginBottom: 6 }}>Acces Personal</h2>
            <p style={{ color: "#777", fontSize: 14, marginBottom: 24 }}>Introdu parola pentru a accesa calendarul intern</p>
            <div style={{ marginBottom: 16, textAlign: "left" }}>
              <label>Parolă</label>
              <input type="password" placeholder="••••••••" value={staffPass}
                onChange={e => { setStaffPass(e.target.value); setPassError(false); }}
                onKeyDown={e => e.key === "Enter" && handleStaffLogin()} />
              {passError && <p style={{ color: "#C62828", fontSize: 13, marginTop: 6 }}>Parolă incorectă.</p>}
            </div>
            <button className="btn-primary" style={{ width: "100%" }} onClick={handleStaffLogin}>Intră în calendar</button>
          </div>
        </div>
      )}
      {!loading && view === "staff" && <StaffView bookings={bookings} updateStatus={updateStatus} onLogout={() => setView("client")} />}
    </div>
  );
}

function ClientView({ bookings, addBooking }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", plate: "", date: "", time: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const bookedSlots = useMemo(() => {
    const map = {};
    bookings.filter(b => b.status !== "anulat").forEach(b => {
      if (!map[b.date]) map[b.date] = new Set();
      map[b.date].add(b.time);
    });
    return map;
  }, [bookings]);

  const today = getDateKey(new Date());

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Introdu numele";
    if (!form.phone.trim() || !/^07\d{8}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Număr invalid (ex: 0722111222)";
    if (!form.plate.trim()) e.plate = "Introdu numărul de înmatriculare";
    if (!form.date) e.date = "Alege data";
    if (!form.time) e.time = "Alege ora";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await addBooking({ ...form, service: selectedService.id });
    setSaving(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 480, margin: "60px auto", padding: 24, textAlign: "center" }}>
        <div className="card">
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ marginBottom: 8 }}>Programare confirmată!</h2>
          <p style={{ color: "#555", marginBottom: 20, lineHeight: 1.6 }}>
            <strong>{form.name}</strong>, ai fost programat pentru<br/>
            <strong>{selectedService.name}</strong> pe <strong>{form.date}</strong> la <strong>{form.time}</strong>.
          </p>
          <div style={{ background: "#FFF3EE", borderRadius: 8, padding: 16, marginBottom: 20, textAlign: "left" }}>
            <div style={{ fontSize: 13, color: "#555" }}>
              <div>🚗 Mașina: <strong>{form.plate}</strong></div>
              <div style={{ marginTop: 6 }}>📞 Vom confirma pe: <strong>{form.phone}</strong></div>
              <div style={{ marginTop: 6 }}>💰 Preț estimat: <strong>{selectedService.price} RON</strong></div>
            </div>
          </div>
          <button className="btn-primary" onClick={() => { setSubmitted(false); setStep(1); setSelectedService(null); setForm({ name: "", phone: "", plate: "", date: "", time: "" }); }}>
            Fă altă programare
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ background: "#1C1C1E", borderRadius: 16, padding: "32px 28px", marginBottom: 28, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: "#E8540A", fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Vulcanizare Timișoara</p>
          <h1 style={{ color: "white", fontSize: 26, fontWeight: 800, lineHeight: 1.2, marginBottom: 10 }}>Programare rapidă,<br/>fără așteptare</h1>
          <p style={{ color: "#888", fontSize: 14 }}>Alege serviciul, ora liberă și ești gata în 2 minute.</p>
        </div>
        <div style={{ fontSize: 64, opacity: 0.9 }}>🔧</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["Serviciu", "Detalii", "Confirmare"].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, opacity: step >= i + 1 ? 1 : 0.4 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: step > i + 1 ? "#2E7D32" : step === i + 1 ? "#E8540A" : "#ddd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", fontWeight: 700 }}>
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{s}</span>
            {i < 2 && <span style={{ color: "#ccc" }}>›</span>}
          </div>
        ))}
      </div>

      {step === 1 && (
        <>
          <h2 style={{ marginBottom: 16, fontSize: 18 }}>Alege serviciul dorit</h2>
          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {SERVICES.map(s => (
              <div key={s.id} className="card" style={{ cursor: "pointer", border: selectedService?.id === s.id ? "2px solid #E8540A" : "2px solid transparent" }} onClick={() => setSelectedService(s)}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{s.name}</div>
                <div style={{ color: "#777", fontSize: 13, marginBottom: 10, lineHeight: 1.4 }}>{s.desc}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, color: "#E8540A", fontSize: 16 }}>{s.price} RON</span>
                  <span style={{ fontSize: 12, color: "#999" }}>⏱ {s.duration} min</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <button className="btn-primary" disabled={!selectedService} style={{ opacity: selectedService ? 1 : 0.4 }} onClick={() => setStep(2)}>Continuă →</button>
          </div>
        </>
      )}

      {step === 2 && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #eee" }}>
            <span style={{ fontSize: 22 }}>{selectedService.icon}</span>
            <div>
              <div style={{ fontWeight: 700 }}>{selectedService.name}</div>
              <div style={{ color: "#E8540A", fontWeight: 700 }}>{selectedService.price} RON · {selectedService.duration} min</div>
            </div>
          </div>
          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label>Nume complet</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ion Popescu" />
              {errors.name && <p style={{ color: "#C62828", fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
            </div>
            <div>
              <label>Telefon</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0722111222" />
              {errors.phone && <p style={{ color: "#C62828", fontSize: 12, marginTop: 4 }}>{errors.phone}</p>}
            </div>
            <div>
              <label>Nr. înmatriculare</label>
              <input value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value.toUpperCase() })} placeholder="TM-01-ABC" />
              {errors.plate && <p style={{ color: "#C62828", fontSize: 12, marginTop: 4 }}>{errors.plate}</p>}
            </div>
            <div>
              <label>Data dorită</label>
              <input type="date" value={form.date} min={today} onChange={e => setForm({ ...form, date: e.target.value, time: "" })} />
              {errors.date && <p style={{ color: "#C62828", fontSize: 12, marginTop: 4 }}>{errors.date}</p>}
            </div>
          </div>
          {form.date && (
            <div style={{ marginTop: 16 }}>
              <label>Oră disponibilă</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 8 }}>
                {HOURS.map(h => {
                  const taken = (bookedSlots[form.date] || new Set()).has(h);
                  return (
                    <button key={h} disabled={taken}
                      style={{ padding: "8px 4px", borderRadius: 8, border: form.time === h ? "2px solid #E8540A" : "1.5px solid #ddd", background: taken ? "#f5f5f5" : form.time === h ? "#FFF3EE" : "white", color: taken ? "#bbb" : form.time === h ? "#E8540A" : "#1C1C1E", fontWeight: 600, fontSize: 13, cursor: taken ? "not-allowed" : "pointer" }}
                      onClick={() => !taken && setForm({ ...form, time: h })}>
                      {taken ? <s>{h}</s> : h}
                    </button>
                  );
                })}
              </div>
              {errors.time && <p style={{ color: "#C62828", fontSize: 12, marginTop: 4 }}>{errors.time}</p>}
            </div>
          )}
          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "space-between" }}>
            <button className="btn-secondary" onClick={() => setStep(1)}>← Înapoi</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Se salvează..." : "Confirmă programarea ✓"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffView({ bookings, updateStatus, onLogout }) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(getDateKey(today));
  const [filterStatus, setFilterStatus] = useState("toate");

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach(b => { if (!map[b.date]) map[b.date] = []; map[b.date].push(b); });
    return map;
  }, [bookings]);

  const dayBookings = useMemo(() => {
    let list = bookingsByDate[selectedDate] || [];
    if (filterStatus !== "toate") list = list.filter(b => b.status === filterStatus);
    return list.sort((a, b) => a.time.localeCompare(b.time));
  }, [bookingsByDate, selectedDate, filterStatus]);

  const totalRevenue = dayBookings.filter(b => b.status === "finalizat").reduce((s, b) => s + (SERVICES.find(sv => sv.id === b.service)?.price || 0), 0);

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>📋 Calendar Programări</h1>
          <p style={{ color: "#777", fontSize: 14 }}>Gestionează programările și statusul lucrărilor</p>
        </div>
        <button className="btn-secondary" onClick={onLogout} style={{ fontSize: 13 }}>Ieșire ↗</button>
      </div>

      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#555" }} onClick={prevMonth}>‹</button>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{MONTHS_RO[calMonth]} {calYear}</span>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#555" }} onClick={nextMonth}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {DAYS_RO.map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#999", padding: "4px 0" }}>{d}</div>)}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const count = bookingsByDate[dateKey]?.filter(b => b.status !== "anulat").length || 0;
              const isToday = dateKey === getDateKey(today);
              const isSelected = dateKey === selectedDate;
              return (
                <button key={day} onClick={() => setSelectedDate(dateKey)}
                  style={{ padding: "6px 2px", borderRadius: 8, border: "none", cursor: "pointer", background: isSelected ? "#E8540A" : isToday ? "#FFF3EE" : "transparent", color: isSelected ? "white" : isToday ? "#E8540A" : "#1C1C1E", fontWeight: isToday || isSelected ? 700 : 400, fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  {day}
                  {count > 0 && <span style={{ width: 6, height: 6, borderRadius: "50%", background: isSelected ? "rgba(255,255,255,0.8)" : "#E8540A", display: "block" }} />}
                </button>
              );
            })}
          </div>
          <div style={{ borderTop: "1px solid #eee", marginTop: 16, paddingTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#777", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Azi</div>
            {(bookingsByDate[getDateKey(today)] || []).length === 0
              ? <p style={{ color: "#bbb", fontSize: 13 }}>Nicio programare</p>
              : (bookingsByDate[getDateKey(today)] || []).map(b => (
                <div key={b.id} style={{ fontSize: 13, padding: "4px 0", borderBottom: "1px solid #f5f5f5", display: "flex", gap: 8 }}>
                  <span style={{ color: "#E8540A", fontWeight: 700 }}>{b.time}</span>
                  <span style={{ color: "#555" }}>{b.name}</span>
                </div>
              ))}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>{selectedDate}</h3>
              <p style={{ color: "#777", fontSize: 13 }}>{dayBookings.length} programări · {totalRevenue > 0 ? `${totalRevenue} RON încasați` : "0 RON"}</p>
            </div>
            <select style={{ width: "auto", padding: "6px 12px", fontSize: 13 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="toate">Toate</option>
              <option value="confirmat">Confirmate</option>
              <option value="finalizat">Finalizate</option>
              <option value="anulat">Anulate</option>
            </select>
          </div>
          {dayBookings.length === 0
            ? <div className="card" style={{ textAlign: "center", padding: 40, color: "#bbb" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📅</div><p>Nicio programare pentru această zi</p></div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dayBookings.map(b => {
                const service = SERVICES.find(s => s.id === b.service);
                return (
                  <div key={b.id} className="card" style={{ borderLeft: `4px solid ${b.status === "finalizat" ? "#2E7D32" : b.status === "anulat" ? "#C62828" : "#E8540A"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, color: "#E8540A", fontSize: 16 }}>{b.time}</span>
                          <span className={`tag-${b.status}`}>{b.status}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{b.name}</div>
                        <div style={{ color: "#777", fontSize: 13, marginTop: 2 }}>{service?.icon} {service?.name} · 🚗 {b.plate} · 📞 {b.phone}</div>
                        <div style={{ color: "#E8540A", fontWeight: 600, fontSize: 13, marginTop: 4 }}>{service?.price} RON · {service?.duration} min</div>
                      </div>
                      {b.status !== "anulat" && (
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          {b.status === "confirmat" && <button className="btn-primary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => updateStatus(b.id, "finalizat")}>✓ Finalizat</button>}
                          <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12, color: "#C62828", borderColor: "#C62828" }} onClick={() => updateStatus(b.id, "anulat")}>✕ Anulat</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>}
          {dayBookings.length > 0 && (
            <div className="card" style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, background: "#1C1C1E" }}>
              {[
                { label: "Confirmate", val: dayBookings.filter(b => b.status === "confirmat").length, color: "#E8540A" },
                { label: "Finalizate", val: dayBookings.filter(b => b.status === "finalizat").length, color: "#4CAF50" },
                { label: "Venit zi", val: `${totalRevenue} RON`, color: "#64B5F6" },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 20, color }}>{val}</div>
                  <div style={{ color: "#888", fontSize: 12 }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
