import React from 'react';
import { MouseSpotlight } from '../motion/MouseSpotlight';
import { Database, Activity, ShieldCheck, Zap } from 'lucide-react';

export const PremiumBento = () => {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-medium text-slate-900 tracking-tight mb-4">Enterprise capabilities.</h2>
          <p className="text-xl text-slate-600 font-light">Built for scale, compliance, and real impact.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          
          {/* Large Card */}
          <MouseSpotlight spotlightColor="rgba(16, 185, 129, 0.05)" className="md:col-span-2 rounded-3xl bg-slate-50 border border-slate-200 p-8 flex flex-col justify-between group shadow-sm hover:shadow-md transition-shadow">
            <div>
              <Database className="w-8 h-8 text-emerald-500 mb-6" />
              <h3 className="text-2xl font-medium text-slate-900 mb-2">Automated Data Ingestion</h3>
              <p className="text-slate-600 font-light max-w-md">Connect directly to AWS, GCP, and Azure to pull compute telemetry. Integrate ERP systems for automatic supply chain tracking without manual spreadsheets.</p>
            </div>
            <div className="text-emerald-600/70 font-mono text-sm group-hover:text-emerald-600 transition-colors font-medium">
              [ REAL IMPACT: 90% reduction in reporting time ]
            </div>
          </MouseSpotlight>

          {/* Tall Card */}
          <MouseSpotlight spotlightColor="rgba(16, 185, 129, 0.05)" className="row-span-2 rounded-3xl bg-slate-50 border border-slate-200 p-8 flex flex-col justify-between group shadow-sm hover:shadow-md transition-shadow">
            <div>
              <ShieldCheck className="w-8 h-8 text-emerald-500 mb-6" />
              <h3 className="text-2xl font-medium text-slate-900 mb-2">Audit-Ready Compliance</h3>
              <p className="text-slate-600 font-light">Generate reports aligned with GHG Protocol, ISO 14064, and CSRD directives instantly.</p>
            </div>
            
            {/* Visual element */}
            <div className="w-full aspect-square mt-8 rounded-2xl border border-slate-200 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-100 to-transparent">
               <div className="w-16 h-16 rounded-full border border-emerald-500/30 flex items-center justify-center bg-white">
                 <div className="w-8 h-8 rounded-full bg-emerald-500/20 animate-ping"></div>
               </div>
            </div>
          </MouseSpotlight>

          {/* Standard Card 1 */}
          <MouseSpotlight spotlightColor="rgba(16, 185, 129, 0.05)" className="rounded-3xl bg-slate-50 border border-slate-200 p-8 flex flex-col justify-between group shadow-sm hover:shadow-md transition-shadow">
            <div>
              <Activity className="w-8 h-8 text-emerald-500 mb-6" />
              <h3 className="text-xl font-medium text-slate-900 mb-2">Real-time Analytics</h3>
              <p className="text-slate-600 font-light text-sm">Stop waiting for annual reviews. Track anomalies as they happen.</p>
            </div>
          </MouseSpotlight>

          {/* Standard Card 2 */}
          <MouseSpotlight spotlightColor="rgba(16, 185, 129, 0.05)" className="rounded-3xl bg-slate-50 border border-slate-200 p-8 flex flex-col justify-between group shadow-sm hover:shadow-md transition-shadow">
            <div>
              <Zap className="w-8 h-8 text-emerald-500 mb-6" />
              <h3 className="text-xl font-medium text-slate-900 mb-2">AI Reductions</h3>
              <p className="text-slate-600 font-light text-sm">Machine learning algorithms suggest the most cost-effective reduction strategies.</p>
            </div>
          </MouseSpotlight>

        </div>
      </div>
    </section>
  );
};
