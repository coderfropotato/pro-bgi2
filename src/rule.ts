    // 基因表和富集有选择基因功能的大表 需要特殊过滤的表头
   export const matchList:string[]  = [
       "cellmarker_desc","cr2cancer_desc","phi_desc","prg_desc","genebank_desc","rfam_term_id","rfam_term","rfam_desc","pfam_term_id","pfam_term","pfam_desc","reactome_term_id","reactome_term","reactome_desc","cog_term_id","cog_term","cog_desc","eggnog_term_id","eggnog_term","eggnog_desc","tf_term_id","tf_term","tf_desc","tf_cofactors_id","tf_cofactors_term","tf_cofactors_desc","go_f_term_id","go_f_term","go_f_desc","go_p_term_id","go_p_term","go_p_desc","go_c_term_id","go_c_term","go_c_desc","interpro_term_id","interpro_term","interpro_desc","kegg_disease_term_id","kegg_disease_term","kegg_disease_desc","kegg_module_term_id","kegg_module_term","kegg_module_desc","kegg_pathway_term_id","kegg_pathway_term","kegg_pathway_desc","kegg_reaction_term_id","kegg_reaction_term","kegg_reaction_desc","msigdb_archived_c5_bp_term_id","msigdb_archived_c5_bp_term","msigdb_archived_c5_bp_desc","msigdb_archived_c5_cc_term_id","msigdb_archived_c5_cc_term","msigdb_archived_c5_cc_desc","msigdb_archived_c5_mf_term_id","msigdb_archived_c5_mf_term","msigdb_archived_c5_mf_desc","msigdb_c1_term_id","msigdb_c1_term","msigdb_c1_desc","msigdb_c2_cgp_term_id","msigdb_c2_cgp_term","msigdb_c2_cgp_desc","msigdb_c2_cp_biocarta_term_id","msigdb_c2_cp_biocarta_term","msigdb_c2_cp_biocarta_desc","msigdb_c2_cp_kegg_term_id","msigdb_c2_cp_kegg_term","msigdb_c2_cp_kegg_desc","msigdb_c2_cp_reactome_term_id","msigdb_c2_cp_reactome_term","msigdb_c2_cp_reactome_desc","msigdb_c2_cp_term_id","msigdb_c2_cp_term","msigdb_c2_cp_desc","msigdb_c3_mir_term_id","msigdb_c3_mir_term","msigdb_c3_mir_desc","msigdb_c3_tft_term_id","msigdb_c3_tft_term","msigdb_c3_tft_desc","msigdb_c4_cgn_term_id","msigdb_c4_cgn_term","msigdb_c4_cgn_desc","msigdb_c4_cm_term_id","msigdb_c4_cm_term","msigdb_c4_cm_desc","msigdb_c5_bp_term_id","msigdb_c5_bp_term","msigdb_c5_bp_desc","msigdb_c5_cc_term_id","msigdb_c5_cc_term","msigdb_c5_cc_desc","msigdb_c5_mf_term_id","msigdb_c5_mf_term","msigdb_c5_mf_desc","msigdb_c6_term_id","msigdb_c6_term","msigdb_c6_desc","msigdb_c7_term_id","msigdb_c7_term","msigdb_c7_desc","msigdb_h_term_id","msigdb_h_term","msigdb_h_desc"
    ];
    // 匹配规则
    export const matchRule:object = {
        "cellmarker_desc":{"url":"","arg":[]},
        "cr2cancer_desc":{"url":"","arg":[]},
        "phi_desc":{"url":"","arg":[]},
        "prg_desc":{"url":"","arg":[]},
        "genebank_desc":{"url":"","arg":[]},

        "rfam_term_id":{"url":"","arg":[]},
        "rfam_term":{"url":"","arg":[]},
        "rfam_desc":{"url":"","arg":[]},

        "pfam_term_id":{"url":"http://pfam.xfam.org/family/@","arg":[0]},
        "pfam_term":{"url":"http://pfam.xfam.org/family/@","arg":[0]},
        "pfam_desc":{"url":"http://pfam.xfam.org/family/@","arg":[0]},

        "reactome_term_id":{"url":"https://reactome.org/","arg":[]},
        "reactome_term":{"url":"https://reactome.org/","arg":[]},
        "reactome_desc":{"url":"https://reactome.org/","arg":[]},

        "cog_term_id":{"url":"ftp://ftp.ncbi.nih.gov/pub/COG/COG2014/static/byCOG/@","arg":[0]},
        "cog_term":{"url":"ftp://ftp.ncbi.nih.gov/pub/COG/COG2014/static/byCOG/@","arg":[0]},
        "cog_desc":{"url":"ftp://ftp.ncbi.nih.gov/pub/COG/COG2014/static/byCOG/@","arg":[0]},

        "eggnog_term_id":{"url":"http://eggnogdb.embl.de/#/app/home","arg":[]},
        "eggnog_term":{"url":"http://eggnogdb.embl.de/#/app/home","arg":[]},
        "eggnog_desc":{"url":"http://eggnogdb.embl.de/#/app/home","arg":[]},

        // 根据info中的species_kingdom 的值判断  animal/plant/fungi/other
        // url 动物 植物
        "tf_term_id":{"url":["http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/tf_summary?family=@","http://planttfdb.cbi.pku.edu.cn/family.php?fam=@"],"arg":[0,1],"session":"species_kingdom",},
        "tf_term":{"url":["http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/tf_summary?family=@","http://planttfdb.cbi.pku.edu.cn/family.php?fam=@"],"arg":[0,1],"session":"species_kingdom",},
        "tf_desc":{"url":["http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/tf_summary?family=@","http://planttfdb.cbi.pku.edu.cn/family.php?fam=@"],"arg":[0,1],"session":"species_kingdom",},

        "tf_cofactors_id":{"url":"http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/","arg":[]},
        "tf_cofactors_term":{"url":"http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/","arg":[]},
        "tf_cofactors_desc":{"url":"http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/","arg":[]},

        "go_f_term_id":{"url":"http://amigo.geneontology.org/amigo/term/@","arg":[0]},
        "go_f_term":{"url":"http://amigo.geneontology.org/amigo/term/@","arg":[0]},
        "go_f_desc":{"url":"http://amigo.geneontology.org/amigo/term/@","arg":[0]},
        "go_p_term_id":{"url":"http://amigo.geneontology.org/amigo/term/@","arg":[0]},
        "go_p_term":{"url":"http://amigo.geneontology.org/amigo/term/@","arg":[0]},
        "go_p_desc":{"url":"http://amigo.geneontology.org/amigo/term/@","arg":[0]},
        "go_c_term_id":{"url":"http://amigo.geneontology.org/amigo/term/@","arg":[0]},
        "go_c_term":{"url":"http://amigo.geneontology.org/amigo/term/@","arg":[0]},
        "go_c_desc":{"url":"http://amigo.geneontology.org/amigo/term/@","arg":[0]},

        "interpro_term_id":{"url":"https://www.ebi.ac.uk/interpro/entry/@","arg":[0]},
        "interpro_term":{"url":"https://www.ebi.ac.uk/interpro/entry/@","arg":[0]},
        "interpro_desc":{"url":"https://www.ebi.ac.uk/interpro/entry/@","arg":[0]},

        "kegg_disease_term_id":{"url":"https://www.kegg.jp/dbget-bin/www_bget?ds:@","arg":[0]},
        "kegg_disease_term":{"url":"https://www.kegg.jp/dbget-bin/www_bget?ds:@","arg":[0]},
        "kegg_disease_desc":{"url":"https://www.kegg.jp/dbget-bin/www_bget?ds:@","arg":[0]},

        "kegg_module_term_id":{"url":"https://www.kegg.jp/kegg-bin/show_module?@","arg":[0]},
        "kegg_module_term":{"url":"https://www.kegg.jp/kegg-bin/show_module?@","arg":[0]},
        "kegg_module_desc":{"url":"https://www.kegg.jp/kegg-bin/show_module?@","arg":[0]},

        "kegg_pathway_term_id":{"url":"https://www.kegg.jp/dbget-bin/www_bget?map@","arg":[0]},
        "kegg_pathway_term":{"url":"https://www.kegg.jp/dbget-bin/www_bget?map@","arg":[0]},
        "kegg_pathway_desc":{"url":"https://www.kegg.jp/dbget-bin/www_bget?map@","arg":[0]},

        "kegg_reaction_term_id":{"url":"https://www.kegg.jp/dbget-bin/www_bget?rn:@","arg":[0]},
        "kegg_reaction_term":{"url":"https://www.kegg.jp/dbget-bin/www_bget?rn:@","arg":[0]},
        "kegg_reaction_desc":{"url":"https://www.kegg.jp/dbget-bin/www_bget?rn:@","arg":[0]},

        "msigdb_archived_c5_bp_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_archived_c5_bp_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_archived_c5_bp_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_archived_c5_cc_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_archived_c5_cc_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_archived_c5_cc_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_archived_c5_mf_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_archived_c5_mf_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_archived_c5_mf_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c1_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c1_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c1_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c2_cgp_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c2_cgp_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c2_cgp_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c2_cp_biocarta_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c2_cp_biocarta_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c2_cp_biocarta_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c2_cp_kegg_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c2_cp_kegg_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c2_cp_kegg_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c2_cp_reactome_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c2_cp_reactome_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c2_cp_reactome_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c2_cp_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c2_cp_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c2_cp_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c3_mir_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c3_mir_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c3_mir_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c3_tft_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c3_tft_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c3_tft_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c4_cgn_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c4_cgn_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c4_cgn_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c4_cm_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c4_cm_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c4_cm_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c5_bp_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c5_bp_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c5_bp_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c5_cc_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c5_cc_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c5_cc_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c5_mf_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c5_mf_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c5_mf_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c6_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c6_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c6_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c7_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c7_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_c7_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_h_term_id":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_h_term":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]},
        "msigdb_h_desc":{"url":"http://software.broadinstitute.org/gsea/msigdb/cards/@","arg":[0]}
    }